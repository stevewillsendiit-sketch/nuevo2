//
//  MensajesViewModel.swift
//  Milanuncios
//
//  Created on 11/12/2025
//  FIXED: Usa colección separada "mensajes" como en web
//

import Foundation
import Combine
import FirebaseFirestore

class MensajesViewModel: ObservableObject {
    @Published var conversaciones: [Conversacion] = []
    @Published var conversacionActual: Conversacion?
    @Published var isLoading = false
    @Published var nombresUsuarios: [String: String] = [:] // Cache: userId -> nombre
    
    private let db = Firestore.firestore()
    private var listeners: [String: ListenerRegistration] = [:]
    
    init() {
        // No cargar datos demo, solo cuando el usuario inicie sesión
    }
    
    deinit {
        // Limpiar listeners
        listeners.values.forEach { $0.remove() }
    }
    
    // MARK: - Cargar Conversaciones
    
    func cargarConversaciones(userId: String) {
        print("💬 Cargando conversaciones para usuario: \(userId)")
        
        // Limpiar listener anterior si existe
        listeners["conversaciones"]?.remove()
        
        // Escuchar conversaciones donde el usuario es comprador o vendedor
        listeners["conversaciones"] = db.collection("conversaciones")
            .whereField("participantes", arrayContains: userId)
            .addSnapshotListener { [weak self] snapshot, error in
                guard let self = self else { return }
                
                if let error = error {
                    print("❌ Error cargando conversaciones: \(error.localizedDescription)")
                    return
                }
                
                guard let documents = snapshot?.documents else {
                    print("⚠️ No hay conversaciones")
                    DispatchQueue.main.async {
                        self.conversaciones = []
                    }
                    return
                }
                
                print("📦 Conversaciones encontradas: \(documents.count)")
                
                var conversacionesCargadas: [Conversacion] = []
                
                for document in documents {
                    let data = document.data()
                    
                    guard let anuncioId = data["anuncioId"] as? String,
                          let compradorId = data["compradorId"] as? String,
                          let vendedorId = data["vendedorId"] as? String else {
                        continue
                    }
                    
                    let fechaUltimoMensaje: Date
                    if let timestamp = data["fechaUltimoMensaje"] as? Timestamp {
                        fechaUltimoMensaje = timestamp.dateValue()
                    } else {
                        fechaUltimoMensaje = Date()
                    }
                    
                    let noLeidos = data["noLeidos_\(userId)"] as? Int ?? 0
                    
                    let conversacion = Conversacion(
                        id: document.documentID,
                        anuncioId: anuncioId,
                        compradorId: compradorId,
                        vendedorId: vendedorId,
                        mensajes: [],
                        fechaUltimoMensaje: fechaUltimoMensaje,
                        noLeidos: noLeidos
                    )
                    
                    conversacionesCargadas.append(conversacion)
                }
                
                DispatchQueue.main.async {
                    // Ordenar manualmente por fecha (más reciente primero)
                    self.conversaciones = conversacionesCargadas.sorted { $0.fechaUltimoMensaje > $1.fechaUltimoMensaje }
                    
                    // Pre-cargar nombres de usuarios
                    let userIds = Set(conversacionesCargadas.flatMap { [$0.compradorId, $0.vendedorId] })
                    userIds.forEach { userId in
                        if self.nombresUsuarios[userId] == nil {
                            self.cargarNombreUsuario(userId: userId)
                        }
                    }
                    
                    // Cargar mensajes para cada conversación
                    conversacionesCargadas.forEach { conversacion in
                        self.cargarMensajes(conversacionId: conversacion.id)
                    }
                }
            }
    }
    
    // MARK: - Cargar Mensajes
    
    func cargarMensajes(conversacionId: String) {
        print("📨 Cargando mensajes para conversación: \(conversacionId)")
        
        // Limpiar listener anterior si existe
        listeners["mensajes_\(conversacionId)"]?.remove()
        
        // ✅ CAMBIO PRINCIPAL: Usar colección separada "mensajes" con filtro por conversacionId
        listeners["mensajes_\(conversacionId)"] = db.collection("mensajes")
            .whereField("conversacionId", isEqualTo: conversacionId)
            .addSnapshotListener { [weak self] snapshot, error in
                guard let self = self else { return }
                
                if let error = error {
                    print("❌ Error cargando mensajes: \(error.localizedDescription)")
                    return
                }
                
                guard let documents = snapshot?.documents else {
                    print("⚠️ No hay mensajes")
                    return
                }
                
                print("📨 Mensajes recibidos: \(documents.count)")
                
                var mensajes: [Mensaje] = []
                
                for document in documents {
                    let data = document.data()
                    
                    guard let remitenteId = data["remitenteId"] as? String,
                          let contenido = data["contenido"] as? String else {
                        continue
                    }
                    
                    let fecha: Date
                    if let timestamp = data["fecha"] as? Timestamp {
                        fecha = timestamp.dateValue()
                    } else {
                        fecha = Date()
                    }
                    
                    let leido = data["leido"] as? Bool ?? false
                    
                    let fechaLectura: Date?
                    if let timestamp = data["fechaLectura"] as? Timestamp {
                        fechaLectura = timestamp.dateValue()
                    } else {
                        fechaLectura = nil
                    }
                    
                    let mensaje = Mensaje(
                        id: document.documentID,
                        remitenteId: remitenteId,
                        contenido: contenido,
                        fecha: fecha,
                        leido: leido,
                        fechaLectura: fechaLectura
                    )
                    
                    mensajes.append(mensaje)
                    print("💬 Mensaje: \(document.documentID) - \(contenido)")
                }
                
                // Ordenar mensajes por fecha (más antiguos primero)
                mensajes.sort { $0.fecha < $1.fecha }
                
                // Actualizar mensajes en la conversación
                DispatchQueue.main.async {
                    if let index = self.conversaciones.firstIndex(where: { $0.id == conversacionId }) {
                        self.conversaciones[index].mensajes = mensajes
                        print("✅ Mensajes actualizados para conversación \(conversacionId): \(mensajes.count)")
                    }
                }
            }
    }
    
    // MARK: - Enviar Mensaje
    
    func enviarMensaje(conversacionId: String, contenido: String, remitenteId: String) {
        print("📤 Enviando mensaje en conversación: \(conversacionId)")
        print("📝 Contenido: \(contenido)")
        print("👤 Remitente: \(remitenteId)")
        
        guard let conversacion = conversaciones.first(where: { $0.id == conversacionId }) else {
            print("❌ Conversación no encontrada")
            return
        }
        
        // ✅ CAMBIO: Guardar en colección separada "mensajes" con conversacionId
        let mensajeData: [String: Any] = [
            "conversacionId": conversacionId,  // ✅ Añadido
            "remitenteId": remitenteId,
            "contenido": contenido,
            "fecha": Timestamp(date: Date()),
            "leido": false
        ]
        
        // Guardar mensaje en colección separada
        db.collection("mensajes")
            .addDocument(data: mensajeData) { error in
                if let error = error {
                    print("❌ Error guardando mensaje: \(error.localizedDescription)")
                    return
                }
                print("✅ Mensaje guardado en Firestore")
            }
        
        // Actualizar última fecha y no leídos
        let destinatarioId = conversacion.compradorId == remitenteId ? conversacion.vendedorId : conversacion.compradorId
        
        db.collection("conversaciones")
            .document(conversacionId)
            .updateData([
                "ultimoMensaje": contenido,  // ✅ Añadido para mostrar en lista
                "fechaUltimoMensaje": Timestamp(date: Date()),
                "noLeidos_\(destinatarioId)": FieldValue.increment(Int64(1))
            ]) { error in
                if let error = error {
                    print("❌ Error actualizando conversación: \(error.localizedDescription)")
                } else {
                    print("✅ Conversación actualizada")
                }
            }
    }
    
    // MARK: - Borrar Mensaje
    
    func borrarMensaje(conversacionId: String, mensajeId: String) {
        // ✅ CAMBIO: Borrar de colección separada
        db.collection("mensajes")
            .document(mensajeId)
            .delete { error in
                if let error = error {
                    print("❌ Error borrando mensaje: \(error.localizedDescription)")
                } else {
                    print("✅ Mensaje borrado exitosamente")
                }
            }
    }
    
    // MARK: - Borrar Conversación
    
    func borrarConversacion(conversacionId: String) {
        // ✅ CAMBIO: Borrar mensajes de colección separada
        db.collection("mensajes")
            .whereField("conversacionId", isEqualTo: conversacionId)
            .getDocuments { [weak self] snapshot, error in
                guard let self = self else { return }
                
                if let error = error {
                    print("❌ Error obteniendo mensajes para borrar: \(error.localizedDescription)")
                    return
                }
                
                let batch = self.db.batch()
                snapshot?.documents.forEach { document in
                    batch.deleteDocument(document.reference)
                }
                
                // Borrar la conversación
                let conversacionRef = self.db.collection("conversaciones").document(conversacionId)
                batch.deleteDocument(conversacionRef)
                
                batch.commit { error in
                    if let error = error {
                        print("❌ Error borrando conversación: \(error.localizedDescription)")
                    } else {
                        print("✅ Conversación borrada exitosamente")
                        
                        // Remover del array local
                        DispatchQueue.main.async {
                            self.conversaciones.removeAll { $0.id == conversacionId }
                        }
                    }
                }
            }
    }
    
    // MARK: - Marcar como Leído
    
    func marcarComoLeido(conversacionId: String, userId: String) {
        let ahora = Timestamp(date: Date())
        
        // Actualizar contador de no leídos
        db.collection("conversaciones")
            .document(conversacionId)
            .updateData(["noLeidos_\(userId)": 0]) { error in
                if let error = error {
                    print("❌ Error marcando como leído: \(error.localizedDescription)")
                } else {
                    print("✅ Conversación marcada como leída")
                }
            }
        
        // ✅ CAMBIO: Marcar mensajes en colección separada
        db.collection("mensajes")
            .whereField("conversacionId", isEqualTo: conversacionId)
            .whereField("leido", isEqualTo: false)
            .getDocuments { snapshot, error in
                guard let documents = snapshot?.documents else { return }
                
                let batch = self.db.batch()
                var mensajesActualizados = 0
                
                for document in documents {
                    let data = document.data()
                    let remitenteId = data["remitenteId"] as? String ?? ""
                    
                    // Solo marcar mensajes que NO son del usuario actual
                    if remitenteId != userId {
                        let ref = self.db.collection("mensajes").document(document.documentID)
                        
                        batch.updateData([
                            "leido": true,
                            "fechaLectura": ahora
                        ], forDocument: ref)
                        mensajesActualizados += 1
                    }
                }
                
                if mensajesActualizados > 0 {
                    batch.commit { error in
                        if let error = error {
                            print("❌ Error actualizando mensajes: \(error.localizedDescription)")
                        } else {
                            print("✅ \(mensajesActualizados) mensajes marcados como leídos")
                        }
                    }
                }
            }
    }
    
    // MARK: - Iniciar Conversación
    
    func iniciarConversacion(anuncioId: String, vendedorId: String, compradorId: String, completion: @escaping (Conversacion?) -> Void) {
        print("💬 Iniciando conversación - Anuncio: \(anuncioId)")
        
        // Verificar si ya existe una conversación
        db.collection("conversaciones")
            .whereField("anuncioId", isEqualTo: anuncioId)
            .whereField("compradorId", isEqualTo: compradorId)
            .whereField("vendedorId", isEqualTo: vendedorId)
            .getDocuments { [weak self] snapshot, error in
                guard let self = self else { return }
                
                if let error = error {
                    print("❌ Error buscando conversación: \(error.localizedDescription)")
                    completion(nil)
                    return
                }
                
                // Si existe, devolverla
                if let document = snapshot?.documents.first {
                    print("✅ Conversación existente encontrada: \(document.documentID)")
                    let data = document.data()
                    
                    let conversacion = Conversacion(
                        id: document.documentID,
                        anuncioId: anuncioId,
                        compradorId: compradorId,
                        vendedorId: vendedorId,
                        mensajes: [],
                        fechaUltimoMensaje: Date(),
                        noLeidos: 0
                    )
                    
                    // Cargar mensajes
                    self.cargarMensajes(conversacionId: document.documentID)
                    
                    DispatchQueue.main.async {
                        if !self.conversaciones.contains(where: { $0.id == conversacion.id }) {
                            self.conversaciones.insert(conversacion, at: 0)
                        }
                        completion(conversacion)
                    }
                    return
                }
                
                // Si no existe, crearla
                print("📝 Creando nueva conversación")
                let conversacionData: [String: Any] = [
                    "anuncioId": anuncioId,
                    "compradorId": compradorId,
                    "vendedorId": vendedorId,
                    "participantes": [compradorId, vendedorId],
                    "fechaUltimoMensaje": Timestamp(date: Date()),
                    "noLeidos_\(compradorId)": 0,
                    "noLeidos_\(vendedorId)": 0
                ]
                
                let documentRef = self.db.collection("conversaciones").document()
                let conversacionId = documentRef.documentID
                
                documentRef.setData(conversacionData) { error in
                    if let error = error {
                        print("❌ Error creando conversación: \(error.localizedDescription)")
                        completion(nil)
                        return
                    }
                    
                    print("✅ Conversación creada exitosamente con ID: \(conversacionId)")
                    
                    let nuevaConversacion = Conversacion(
                        id: conversacionId,
                        anuncioId: anuncioId,
                        compradorId: compradorId,
                        vendedorId: vendedorId,
                        mensajes: [],
                        fechaUltimoMensaje: Date(),
                        noLeidos: 0
                    )
                    
                    // Cargar mensajes para esta conversación
                    self.cargarMensajes(conversacionId: conversacionId)
                    
                    DispatchQueue.main.async {
                        self.conversaciones.insert(nuevaConversacion, at: 0)
                        completion(nuevaConversacion)
                    }
                }
            }
    }
    
    // MARK: - Cargar Nombre de Usuario
    
    private func cargarNombreUsuario(userId: String) {
        db.collection("usuarios").document(userId).getDocument { [weak self] snapshot, error in
            if let data = snapshot?.data(),
               let nombre = data["nombre"] as? String {
                DispatchQueue.main.async {
                    self?.nombresUsuarios[userId] = nombre
                }
            } else {
                DispatchQueue.main.async {
                    self?.nombresUsuarios[userId] = "Usuario"
                }
            }
        }
    }
}
