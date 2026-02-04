/**
 * Módulo de Validación de Datos
 * Proporciona funciones reutilizables para validar entrada de usuarios
 * Soporta validación cliente-lado antes de guardar en Firestore
 */

/**
 * Validaciones básicas de tipos de datos
 */
export const validators = {
    /**
     * Valida que un string no esté vacío
     * @param {string} value - Valor a validar
     * @param {string} fieldName - Nombre del campo (para mensajes de error)
     * @returns {Object} { valid: boolean, error: string }
     */
    required: (value, fieldName = 'Campo') => {
        if (!value || (typeof value === 'string' && value.trim() === '')) {
            return { valid: false, error: `${fieldName} es requerido` };
        }
        return { valid: true };
    },

    /**
     * Valida que un número sea positivo
     * @param {number|string} value - Valor a validar
     * @param {string} fieldName - Nombre del campo
     * @returns {Object} { valid: boolean, error: string }
     */
    positiveNumber: (value, fieldName = 'Monto') => {
        const num = parseFloat(value);
        
        if (isNaN(num)) {
            return { valid: false, error: `${fieldName} debe ser un número válido` };
        }
        
        if (num <= 0) {
            return { valid: false, error: `${fieldName} debe ser mayor a 0` };
        }
        
        return { valid: true };
    },

    /**
     * Valida que un número esté en un rango específico
     * @param {number|string} value - Valor a validar
     * @param {number} min - Valor mínimo permitido
     * @param {number} max - Valor máximo permitido
     * @param {string} fieldName - Nombre del campo
     * @returns {Object} { valid: boolean, error: string }
     */
    numberRange: (value, min, max, fieldName = 'Valor') => {
        const num = parseFloat(value);
        
        if (isNaN(num)) {
            return { valid: false, error: `${fieldName} debe ser un número válido` };
        }
        
        if (num < min || num > max) {
            return { valid: false, error: `${fieldName} debe estar entre ${min} y ${max}` };
        }
        
        return { valid: true };
    },

    /**
     * Valida que un string tenga una longitud específica
     * @param {string} value - Valor a validar
     * @param {number} minLength - Longitud mínima
     * @param {number} maxLength - Longitud máxima (opcional)
     * @param {string} fieldName - Nombre del campo
     * @returns {Object} { valid: boolean, error: string }
     */
    stringLength: (value, minLength, maxLength = null, fieldName = 'Campo') => {
        const str = String(value || '').trim();
        
        if (str.length < minLength) {
            return { valid: false, error: `${fieldName} debe tener mínimo ${minLength} caracteres` };
        }
        
        if (maxLength && str.length > maxLength) {
            return { valid: false, error: `${fieldName} puede tener máximo ${maxLength} caracteres` };
        }
        
        return { valid: true };
    },

    /**
     * Valida un DNI argentino
     * @param {string} value - Valor a validar
     * @returns {Object} { valid: boolean, error: string }
     */
    dni: (value) => {
        const dni = String(value || '').trim();
        
        if (!dni) {
            return { valid: false, error: 'DNI es requerido' };
        }
        
        // DNI sin puntos ni guiones, solo números
        if (!/^\d{7,8}$/.test(dni)) {
            return { valid: false, error: 'DNI debe ser un número de 7 u 8 dígitos' };
        }
        
        return { valid: true };
    },

    /**
     * Valida un teléfono
     * @param {string} value - Valor a validar
     * @returns {Object} { valid: boolean, error: string }
     */
    phone: (value) => {
        const phone = String(value || '').trim();
        
        if (!phone) {
            return { valid: true }; // Teléfono es opcional
        }
        
        // Acepta números, espacios, guiones, paréntesis y el símbolo +
        if (!/^[0-9+\-() ]{6,}$/.test(phone)) {
            return { valid: false, error: 'Teléfono inválido' };
        }
        
        return { valid: true };
    },

    /**
     * Valida un email
     * @param {string} value - Valor a validar
     * @returns {Object} { valid: boolean, error: string }
     */
    email: (value) => {
        const email = String(value || '').trim();
        
        if (!email) {
            return { valid: true }; // Email es opcional
        }
        
        // Expresión regular simple para validar email
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return { valid: false, error: 'Email inválido' };
        }
        
        return { valid: true };
    },

    /**
     * Valida una fecha en formato YYYY-MM-DD
     * @param {string} value - Valor a validar
     * @returns {Object} { valid: boolean, error: string }
     */
    date: (value) => {
        if (!value) {
            return { valid: true }; // Fecha es opcional
        }
        
        const date = new Date(value);
        
        if (isNaN(date.getTime())) {
            return { valid: false, error: 'Fecha inválida' };
        }
        
        return { valid: true };
    },

    /**
     * Valida que se seleccione al menos una opción de un grupo de checkboxes
     * @param {HTMLCollection|Array} checkboxes - Elementos checkbox
     * @param {string} fieldName - Nombre del campo
     * @returns {Object} { valid: boolean, error: string }
     */
    atLeastOneChecked: (checkboxes, fieldName = 'Opciones') => {
        const checkedCount = Array.from(checkboxes).filter(cb => cb.checked).length;
        
        if (checkedCount === 0) {
            return { valid: false, error: `Selecciona al menos una ${fieldName}` };
        }
        
        return { valid: true };
    },

    /**
     * Valida que se seleccione una opción de radio buttons
     * @param {string} radioName - Nombre del atributo name de los radio buttons
     * @param {string} fieldName - Nombre del campo
     * @returns {Object} { valid: boolean, error: string }
     */
    radioSelected: (radioName, fieldName = 'Opción') => {
        const selected = document.querySelector(`input[name="${radioName}"]:checked`);
        
        if (!selected) {
            return { valid: false, error: `Selecciona una ${fieldName}` };
        }
        
        return { valid: true };
    },

    /**
     * Valida que un select tenga un valor válido
     * @param {HTMLSelectElement} selectElement - Elemento select
     * @param {string} fieldName - Nombre del campo
     * @returns {Object} { valid: boolean, error: string }
     */
    selectNotEmpty: (selectElement, fieldName = 'Selección') => {
        if (!selectElement.value || selectElement.value === '') {
            return { valid: false, error: `${fieldName} es requerida` };
        }
        
        return { valid: true };
    },

    /**
     * Valida un porcentaje (0-100)
     * @param {number|string} value - Valor a validar
     * @param {string} fieldName - Nombre del campo
     * @returns {Object} { valid: boolean, error: string }
     */
    percentage: (value, fieldName = 'Porcentaje') => {
        const num = parseFloat(value);
        
        if (isNaN(num)) {
            return { valid: false, error: `${fieldName} debe ser un número` };
        }
        
        if (num < 0 || num > 100) {
            return { valid: false, error: `${fieldName} debe estar entre 0 y 100` };
        }
        
        return { valid: true };
    }
};

/**
 * Validar múltiples campos a la vez
 * @param {Object} fields - Objeto con { fieldName: { value, rules: [Array de reglas] } }
 * @returns {Object} { valid: boolean, errors: {} }
 * 
 * Ejemplo:
 * validateFields({
 *   nombre: { value: 'Juan', rules: [['required']] },
 *   monto: { value: '1500', rules: [['positiveNumber']] }
 * })
 */
export function validateFields(fields) {
    const errors = {};
    let valid = true;

    for (const [fieldName, fieldData] of Object.entries(fields)) {
        const { value, rules } = fieldData;

        for (const rule of rules) {
            const [validatorName, ...args] = Array.isArray(rule) ? rule : [rule];
            const validator = validators[validatorName];

            if (!validator) {
                console.warn(`Validador "${validatorName}" no encontrado`);
                continue;
            }

            const result = validator(value, ...args);

            if (!result.valid) {
                errors[fieldName] = result.error;
                valid = false;
                break; // Solo mostrar el primer error de cada campo
            }
        }
    }

    return { valid, errors };
}

/**
 * Mostrar errores de validación en la UI
 * @param {Object} errors - Objeto de errores de validateFields
 * @param {string} containerId - ID del contenedor donde mostrar errores
 */
export function displayValidationErrors(errors, containerId = 'validationErrors') {
    const container = document.getElementById(containerId);
    
    if (!container) return;

    // Limpiar errores anteriores
    container.innerHTML = '';
    container.classList.add('hidden');

    if (Object.keys(errors).length === 0) {
        return;
    }

    // Mostrar errores
    const errorList = document.createElement('ul');
    errorList.className = 'list-disc list-inside text-sm text-red-700';

    for (const [fieldName, error] of Object.entries(errors)) {
        const li = document.createElement('li');
        li.textContent = error;
        errorList.appendChild(li);
    }

    const errorWrapper = document.createElement('div');
    errorWrapper.className = 'p-4 bg-red-50 border border-red-300 rounded-lg mb-4';
    errorWrapper.appendChild(errorList);

    container.appendChild(errorWrapper);
    container.classList.remove('hidden');

    // Scroll hacia el contenedor de errores
    container.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/**
 * Limpiar errores de validación
 * @param {string} containerId - ID del contenedor
 */
export function clearValidationErrors(containerId = 'validationErrors') {
    const container = document.getElementById(containerId);
    if (container) {
        container.innerHTML = '';
        container.classList.add('hidden');
    }
}

/**
 * Validador personalizado para archivos
 * @param {File} file - Archivo a validar
 * @param {Array} allowedTypes - Tipos MIME permitidos (ej: ['image/jpeg', 'image/png'])
 * @param {number} maxSizeMB - Tamaño máximo en MB
 * @returns {Object} { valid: boolean, error: string }
 */
export function validateFile(file, allowedTypes = [], maxSizeMB = 5) {
    if (!file) {
        return { valid: true };
    }

    // Validar tipo
    if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
        return { 
            valid: false, 
            error: `Tipo de archivo no permitido. Aceptados: ${allowedTypes.join(', ')}` 
        };
    }

    // Validar tamaño
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
        return { 
            valid: false, 
            error: `Archivo demasiado grande. Máximo: ${maxSizeMB}MB` 
        };
    }

    return { valid: true };
}

/**
 * Sanitizar entrada de texto para evitar XSS
 * @param {string} text - Texto a sanitizar
 * @returns {string} Texto sanitizado
 */
export function sanitizeInput(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Formato de moneda
 * @param {number} amount - Cantidad a formatear
 * @returns {string} Cantidad formateada (ej: "$1.500,00")
 */
export function formatCurrency(amount) {
    const num = parseFloat(amount) || 0;
    return `$${num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
}

/**
 * Formato de porcentaje
 * @param {number} value - Valor a formatear
 * @returns {string} Valor formateado (ej: "15%")
 */
export function formatPercentage(value) {
    const num = parseFloat(value) || 0;
    return `${num.toFixed(1)}%`;
}
