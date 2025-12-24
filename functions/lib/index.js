"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.onMessageCreate = exports.autoAprobarAnuncios = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
admin.initializeApp();
const db = admin.firestore();
// ============================================
// AUTO-APROBAR ANUNCIOS EN REVISIÓN
// Se ejecuta cada minuto y aprueba anuncios que llevan más de 30 segundos en revisión
// ============================================
exports.autoAprobarAnuncios = functions.pubsub
    .schedule('every 1 minutes')
    .onRun(async () => {
    try {
        const ahora = new Date();
        const hace30Segundos = new Date(ahora.getTime() - 30 * 1000); // 30 segundos atrás
        // Buscar anuncios en revisión
        const anunciosEnRevision = await db.collection('anuncios')
            .where('estado', '==', 'En revisión')
            .get();
        if (anunciosEnRevision.empty) {
            console.log('No hay anuncios en revisión');
            return null;
        }
        const batch = db.batch();
        let aprobados = 0;
        for (const doc of anunciosEnRevision.docs) {
            const data = doc.data();
            const fechaCreacion = data.fechaCreacionRevision
                ? new Date(data.fechaCreacionRevision)
                : (data.fechaCreacion?.toDate ? data.fechaCreacion.toDate() : new Date(data.fechaCreacion));
            // Si han pasado más de 30 segundos desde la creación
            if (fechaCreacion < hace30Segundos) {
                batch.update(doc.ref, {
                    estado: 'Activo',
                    fechaAprobacionAuto: admin.firestore.FieldValue.serverTimestamp()
                });
                aprobados++;
                console.log(`✅ Auto-aprobando anuncio: ${doc.id}`);
            }
        }
        if (aprobados > 0) {
            await batch.commit();
            console.log(`✅ ${aprobados} anuncios auto-aprobados`);
        }
        return null;
    }
    catch (error) {
        console.error('Error en auto-aprobación:', error);
        return null;
    }
});
// Trigger when a message is created in 'mensajes' collection
exports.onMessageCreate = functions.firestore
    .document('mensajes/{mensajeId}')
    .onCreate(async (snap) => {
    const data = snap.data();
    if (!data)
        return;
    const conversacionId = data.conversacionId;
    const remitenteId = data.remitenteId;
    const contenido = data.contenido;
    try {
        const convRef = db.doc(`conversaciones/${conversacionId}`);
        const convSnap = await convRef.get();
        if (!convSnap.exists)
            return;
        const convData = convSnap.data();
        const participantes = convData?.participantes || [];
        const destinatarios = participantes.filter(p => p !== remitenteId);
        const batch = db.batch();
        // Update ultimoMensaje and fechaUltimoMensaje on conversation
        batch.update(convRef, {
            ultimoMensaje: contenido,
            fechaUltimoMensaje: admin.firestore.FieldValue.serverTimestamp(),
        });
        for (const dest of destinatarios) {
            // Increment per-conversation unread counter
            const field = `noLeidos_${dest}`;
            batch.update(convRef, { [field]: admin.firestore.FieldValue.increment(1) });
            // Increment user's global counter
            const counterRef = db.doc(`counters/${dest}`);
            batch.set(counterRef, { totalNoLeidos: admin.firestore.FieldValue.increment(1) }, { merge: true });
        }
        await batch.commit();
        console.log('Cloud Function: updated conversation counters and user counters');
    }
    catch (err) {
        console.error('Cloud Function error:', err);
    }
});
