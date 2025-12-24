import { db } from './firebase';
import { 
  collection, 
  doc, 
  addDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy,
  Timestamp 
} from 'firebase/firestore';
import { Factura } from '@/types';

const FACTURAS_COLLECTION = 'facturas';

// Datos de la empresa (VINDEL)
const EMPRESA_DATOS = {
  nombre: 'VINDEL Marketplace S.L.',
  cif: 'B12345678',
  direccion: 'Calle Principal 123, 28001 Madrid, España',
  email: 'facturacion@vindel.com',
  telefono: '+34 900 123 456'
};

// Generar número de factura único
const generarNumeroFactura = async (): Promise<string> => {
  const year = new Date().getFullYear();
  const facturasRef = collection(db, FACTURAS_COLLECTION);
  
  try {
    // Intentar obtener todas las facturas sin orderBy (no requiere índice)
    const snapshot = await getDocs(facturasRef);
    
    // Buscar el último número de este año
    let ultimoNumero = 0;
    snapshot.docs.forEach(doc => {
      const factura = doc.data();
      if (factura.numero && factura.numero.startsWith(`VIN-${year}`)) {
        const num = parseInt(factura.numero.split('-')[2]);
        if (!isNaN(num) && num > ultimoNumero) ultimoNumero = num;
      }
    });
    
    const nuevoNumero = ultimoNumero + 1;
    return `VIN-${year}-${nuevoNumero.toString().padStart(5, '0')}`;
  } catch (error) {
    console.error('Error generando número de factura:', error);
    // Generar número basado en timestamp si falla
    const timestamp = Date.now().toString().slice(-5);
    return `VIN-${year}-${timestamp}`;
  }
};

// Crear nueva factura
export const crearFactura = async (datos: {
  userId: string;
  clienteNombre: string;
  clienteEmail: string;
  clienteTelefono?: string;
  clienteDireccion?: string;
  clienteCif?: string;
  concepto: string;
  descripcion: string;
  cantidad: number;
  precioUnitario: number;
  metodoPago: 'creditos' | 'tarjeta' | 'paypal';
  planId?: string;
  planTipo?: string;
}): Promise<Factura> => {
  const numero = await generarNumeroFactura();
  
  // Calcular importes
  const subtotal = datos.cantidad * datos.precioUnitario;
  const iva = 21; // 21% IVA
  const ivaImporte = subtotal * (iva / 100);
  const total = subtotal + ivaImporte;
  
  const facturaData = {
    numero,
    userId: datos.userId,
    fecha: Timestamp.now(),
    // Cliente
    clienteNombre: datos.clienteNombre,
    clienteEmail: datos.clienteEmail,
    clienteTelefono: datos.clienteTelefono || null,
    clienteDireccion: datos.clienteDireccion || null,
    clienteCif: datos.clienteCif || null,
    // Vendedor
    vendedorNombre: EMPRESA_DATOS.nombre,
    vendedorCif: EMPRESA_DATOS.cif,
    vendedorDireccion: EMPRESA_DATOS.direccion,
    // Detalles
    concepto: datos.concepto,
    descripcion: datos.descripcion,
    cantidad: datos.cantidad,
    precioUnitario: datos.precioUnitario,
    subtotal,
    iva,
    ivaImporte,
    total,
    // Estado
    estado: 'pagada' as const,
    metodoPago: datos.metodoPago,
    // Plan
    planId: datos.planId || null,
    planTipo: datos.planTipo || null
  };
  
  const docRef = await addDoc(collection(db, FACTURAS_COLLECTION), facturaData);
  
  return {
    id: docRef.id,
    ...facturaData,
    fecha: facturaData.fecha.toDate()
  } as Factura;
};

// Obtener facturas de un usuario
export const getFacturasUsuario = async (userId: string): Promise<Factura[]> => {
  const facturasRef = collection(db, FACTURAS_COLLECTION);
  
  try {
    // Solo filtrar por userId, ordenar en cliente
    const q = query(
      facturasRef, 
      where('userId', '==', userId)
    );
    
    const snapshot = await getDocs(q);
    const facturas = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        fecha: data.fecha?.toDate() || new Date()
      } as Factura;
    });
    
    // Ordenar por fecha descendente en cliente
    return facturas.sort((a, b) => b.fecha.getTime() - a.fecha.getTime());
  } catch (error) {
    console.error('Error obteniendo facturas:', error);
    return [];
  }
};

// Obtener una factura por ID
export const getFactura = async (facturaId: string): Promise<Factura | null> => {
  const docRef = doc(db, FACTURAS_COLLECTION, facturaId);
  const docSnap = await getDoc(docRef);
  
  if (!docSnap.exists()) return null;
  
  const data = docSnap.data();
  return {
    id: docSnap.id,
    ...data,
    fecha: data.fecha?.toDate() || new Date()
  } as Factura;
};

// Generar HTML de la factura para PDF
export const generarHTMLFactura = (factura: Factura): string => {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Factura ${factura.numero}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background: #f5f5f5;
      padding: 20px;
      color: #333;
    }
    .invoice {
      max-width: 800px;
      margin: 0 auto;
      background: white;
      box-shadow: 0 4px 20px rgba(0,0,0,0.1);
      border-radius: 12px;
      overflow: hidden;
    }
    .header {
      background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
      color: white;
      padding: 40px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }
    .logo {
      font-size: 32px;
      font-weight: 800;
      letter-spacing: -1px;
    }
    .logo span {
      color: #f59e0b;
    }
    .invoice-info {
      text-align: right;
    }
    .invoice-number {
      font-size: 14px;
      opacity: 0.8;
      margin-bottom: 5px;
    }
    .invoice-date {
      font-size: 18px;
      font-weight: 600;
    }
    .badge {
      display: inline-block;
      background: #22c55e;
      color: white;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      margin-top: 10px;
    }
    .content {
      padding: 40px;
    }
    .parties {
      display: flex;
      justify-content: space-between;
      margin-bottom: 40px;
      gap: 40px;
    }
    .party {
      flex: 1;
    }
    .party-label {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #94a3b8;
      margin-bottom: 10px;
      font-weight: 600;
    }
    .party-name {
      font-size: 18px;
      font-weight: 700;
      color: #1e293b;
      margin-bottom: 8px;
    }
    .party-detail {
      font-size: 14px;
      color: #64748b;
      line-height: 1.6;
    }
    .items-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 30px;
    }
    .items-table th {
      background: #f8fafc;
      padding: 15px;
      text-align: left;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #64748b;
      border-bottom: 2px solid #e2e8f0;
    }
    .items-table th:last-child {
      text-align: right;
    }
    .items-table td {
      padding: 20px 15px;
      border-bottom: 1px solid #f1f5f9;
      vertical-align: top;
    }
    .items-table td:last-child {
      text-align: right;
      font-weight: 600;
    }
    .item-name {
      font-weight: 600;
      color: #1e293b;
      margin-bottom: 4px;
    }
    .item-desc {
      font-size: 13px;
      color: #94a3b8;
    }
    .totals {
      display: flex;
      justify-content: flex-end;
    }
    .totals-box {
      width: 300px;
    }
    .totals-row {
      display: flex;
      justify-content: space-between;
      padding: 10px 0;
      border-bottom: 1px solid #f1f5f9;
    }
    .totals-row.total {
      border-bottom: none;
      padding-top: 15px;
      margin-top: 5px;
      border-top: 2px solid #1e293b;
    }
    .totals-label {
      color: #64748b;
    }
    .totals-value {
      font-weight: 600;
      color: #1e293b;
    }
    .totals-row.total .totals-label,
    .totals-row.total .totals-value {
      font-size: 20px;
      font-weight: 700;
      color: #1e293b;
    }
    .footer {
      background: #f8fafc;
      padding: 30px 40px;
      text-align: center;
      border-top: 1px solid #e2e8f0;
    }
    .footer-text {
      font-size: 13px;
      color: #94a3b8;
      margin-bottom: 10px;
    }
    .footer-contact {
      font-size: 14px;
      color: #64748b;
    }
    .payment-method {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: #f0f9ff;
      color: #0284c7;
      padding: 8px 16px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 500;
      margin-top: 15px;
    }
    @media print {
      body {
        background: white;
        padding: 0;
      }
      .invoice {
        box-shadow: none;
      }
    }
  </style>
</head>
<body>
  <div class="invoice">
    <div class="header">
      <div>
        <div class="logo">VIND<span>E</span>L</div>
        <div style="margin-top: 10px; font-size: 14px; opacity: 0.8;">Marketplace de Anuncios</div>
      </div>
      <div class="invoice-info">
        <div class="invoice-number">Factura Nº</div>
        <div class="invoice-date">${factura.numero}</div>
        <div class="badge">✓ Pagada</div>
      </div>
    </div>
    
    <div class="content">
      <div class="parties">
        <div class="party">
          <div class="party-label">De</div>
          <div class="party-name">${factura.vendedorNombre}</div>
          <div class="party-detail">
            CIF: ${factura.vendedorCif}<br>
            ${factura.vendedorDireccion}<br>
            facturacion@vindel.com
          </div>
        </div>
        <div class="party">
          <div class="party-label">Facturar a</div>
          <div class="party-name">${factura.clienteNombre}</div>
          <div class="party-detail">
            ${factura.clienteCif ? `CIF/NIF: ${factura.clienteCif}<br>` : ''}
            ${factura.clienteDireccion || ''}<br>
            ${factura.clienteEmail}
            ${factura.clienteTelefono ? `<br>Tel: ${factura.clienteTelefono}` : ''}
          </div>
        </div>
      </div>
      
      <div style="margin-bottom: 20px; color: #64748b; font-size: 14px;">
        <strong>Fecha:</strong> ${formatDate(factura.fecha)}
      </div>
      
      <table class="items-table">
        <thead>
          <tr>
            <th>Concepto</th>
            <th>Cantidad</th>
            <th>Precio Unit.</th>
            <th>Importe</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <div class="item-name">${factura.concepto}</div>
              <div class="item-desc">${factura.descripcion}</div>
            </td>
            <td>${factura.cantidad}</td>
            <td>${formatCurrency(factura.precioUnitario)}</td>
            <td>${formatCurrency(factura.subtotal)}</td>
          </tr>
        </tbody>
      </table>
      
      <div class="totals">
        <div class="totals-box">
          <div class="totals-row">
            <span class="totals-label">Subtotal</span>
            <span class="totals-value">${formatCurrency(factura.subtotal)}</span>
          </div>
          <div class="totals-row">
            <span class="totals-label">IVA (${factura.iva}%)</span>
            <span class="totals-value">${formatCurrency(factura.ivaImporte)}</span>
          </div>
          <div class="totals-row total">
            <span class="totals-label">Total</span>
            <span class="totals-value">${formatCurrency(factura.total)}</span>
          </div>
        </div>
      </div>
      
      <div style="text-align: center; margin-top: 30px;">
        <div class="payment-method">
          💳 Método de pago: ${factura.metodoPago === 'creditos' ? 'Créditos VINDEL' : factura.metodoPago === 'tarjeta' ? 'Tarjeta de crédito' : 'PayPal'}
        </div>
      </div>
    </div>
    
    <div class="footer">
      <div class="footer-text">Gracias por confiar en VINDEL</div>
      <div class="footer-contact">
        ¿Tienes alguna pregunta? Contacta con nosotros en facturacion@vindel.com
      </div>
    </div>
  </div>
</body>
</html>
`;
};

// Descargar factura como PDF
export const descargarFacturaPDF = async (factura: Factura): Promise<void> => {
  const html = generarHTMLFactura(factura);
  
  // Crear un iframe oculto para imprimir
  const iframe = document.createElement('iframe');
  iframe.style.position = 'absolute';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = 'none';
  iframe.style.left = '-9999px';
  
  document.body.appendChild(iframe);
  
  const doc = iframe.contentWindow?.document;
  if (doc) {
    doc.open();
    doc.write(html);
    doc.close();
    
    // Esperar a que cargue y luego imprimir/guardar como PDF
    iframe.onload = () => {
      setTimeout(() => {
        iframe.contentWindow?.print();
        // Remover el iframe después de un tiempo
        setTimeout(() => {
          document.body.removeChild(iframe);
        }, 1000);
      }, 500);
    };
  }
};

// Abrir factura en nueva ventana para previsualizar/descargar
export const previsualizarFactura = (factura: Factura): void => {
  const html = generarHTMLFactura(factura);
  const newWindow = window.open('', '_blank');
  if (newWindow) {
    newWindow.document.write(html);
    newWindow.document.close();
  }
};
