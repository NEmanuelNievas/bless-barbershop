/**
 * toast-notifications.js
 * Sistema de notificaciones tipo Toast para la aplicación
 * - Sin dependencias externas
 * - Notificaciones no bloqueantes
 * - Auto-cierre configurable
 */

// Crear contenedor de notificaciones si no existe
function ensureToastContainer() {
    let container = document.getElementById('toastContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toastContainer';
        container.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 9999;
            display: flex;
            flex-direction: column;
            gap: 10px;
            pointer-events: none;
            max-width: 400px;
        `;
        document.body.appendChild(container);
    }
    return container;
}

/**
 * Muestra una notificación Toast
 * @param {string} message - Mensaje a mostrar
 * @param {string} type - Tipo: 'success', 'error', 'warning', 'info'
 * @param {number} duration - Duración en ms (0 = sin auto-cierre)
 */
export function showToast(message, type = 'info', duration = 4000) {
    const container = ensureToastContainer();
    
    // Definir estilos según el tipo
    const styles = {
        success: {
            bg: '#10B981',
            icon: '✓',
            border: '#059669'
        },
        error: {
            bg: '#EF4444',
            icon: '✕',
            border: '#DC2626'
        },
        warning: {
            bg: '#F59E0B',
            icon: '⚠',
            border: '#D97706'
        },
        info: {
            bg: '#3B82F6',
            icon: 'ⓘ',
            border: '#1D4ED8'
        }
    };
    
    const style = styles[type] || styles.info;
    
    // Crear elemento de toast
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.style.cssText = `
        background-color: ${style.bg};
        color: white;
        padding: 16px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        display: flex;
        align-items: center;
        gap: 12px;
        font-weight: 500;
        animation: slideIn 0.3s ease-out;
        pointer-events: auto;
        border-left: 4px solid ${style.border};
        max-width: 100%;
        word-wrap: break-word;
        font-family: 'Inter', 'Segoe UI', sans-serif;
        font-size: 14px;
    `;
    
    // Icono
    const icon = document.createElement('span');
    icon.textContent = style.icon;
    icon.style.cssText = `
        font-size: 18px;
        flex-shrink: 0;
        font-weight: bold;
    `;
    
    // Mensaje
    const messageEl = document.createElement('span');
    messageEl.textContent = message;
    messageEl.style.flex = '1';
    
    // Botón de cerrar
    const closeBtn = document.createElement('button');
    closeBtn.textContent = '×';
    closeBtn.style.cssText = `
        background: none;
        border: none;
        color: white;
        font-size: 24px;
        cursor: pointer;
        padding: 0;
        margin-left: 8px;
        flex-shrink: 0;
        opacity: 0.8;
        transition: opacity 0.2s;
    `;
    closeBtn.onmouseover = () => closeBtn.style.opacity = '1';
    closeBtn.onmouseout = () => closeBtn.style.opacity = '0.8';
    
    closeBtn.addEventListener('click', () => removeToast(toast));
    
    toast.appendChild(icon);
    toast.appendChild(messageEl);
    toast.appendChild(closeBtn);
    container.appendChild(toast);
    
    // Auto-cierre si duration > 0
    if (duration > 0) {
        setTimeout(() => removeToast(toast), duration);
    }
    
    return toast;
}

/**
 * Elimina un toast con animación
 */
function removeToast(toast) {
    toast.style.animation = 'slideOut 0.3s ease-out';
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
}

/**
 * Notificación de éxito
 */
export function showSuccess(message, duration = 3000) {
    return showToast(message, 'success', duration);
}

/**
 * Notificación de error
 */
export function showError(message, duration = 4000) {
    return showToast(message, 'error', duration);
}

/**
 * Notificación de advertencia
 */
export function showWarning(message, duration = 3500) {
    return showToast(message, 'warning', duration);
}

/**
 * Notificación de información
 */
export function showInfo(message, duration = 3000) {
    return showToast(message, 'info', duration);
}

/**
 * Muestra una notificación de confirmación (sin auto-cierre)
 */
export function showConfirm(message) {
    return showToast(message, 'info', 0);
}

/**
 * Agregar estilos de animación al documento si no existen
 */
function addAnimationStyles() {
    if (document.getElementById('toastAnimations')) return;
    
    const style = document.createElement('style');
    style.id = 'toastAnimations';
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(400px);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(400px);
                opacity: 0;
            }
        }
        
        /* Responsive para pantallas pequeñas */
        @media (max-width: 640px) {
            #toastContainer {
                left: 10px !important;
                right: 10px !important;
                max-width: none !important;
            }
        }
    `;
    document.head.appendChild(style);
}

// Inicializar estilos de animación al cargar el módulo
addAnimationStyles();
