// /ProjectLeviathan - Frontend/assets/js/api-service.js

/**
 * Envía una solicitud genérica a la API.
 * @param {string} endpoint - El endpoint de la API al que se llamará.
 * @param {object} options - Opciones para la solicitud fetch (method, body, etc.).
 * @returns {Promise<object>} - La respuesta JSON de la API.
 */
async function request(endpoint, options = {}) {
    try {
        const response = await fetch(endpoint, options);
        return await response.json();
    } catch (error) {
        console.error('API request error:', error);
        return { success: false, message: 'Error de conexión. Inténtalo de nuevo.' };
    }
}

/**
 * Obtiene las fechas de creación de la cuenta y última actualización de contraseña.
 * @returns {Promise<object>}
 */
export async function getAccountDates() {
    return await request(`${window.PROJECT_CONFIG.apiUrl}?action=get_account_dates`);
}

/**
 * Envía una solicitud para actualizar la contraseña.
 * @param {FormData} formData - Los datos del formulario.
 * @returns {Promise<object>}
 */
export async function sendPasswordRequest(formData) {
    return await request(window.PROJECT_CONFIG.apiUrl, {
        method: 'POST',
        body: formData
    });
}

/**
 * Envía una solicitud para eliminar la cuenta del usuario.
 * @param {FormData} formData - Los datos del formulario.
 * @returns {Promise<object>}
 */
export async function deleteAccount(formData) {
    return await request(window.PROJECT_CONFIG.apiUrl, {
        method: 'POST',
        body: formData
    });
}

/**
 * Envía una solicitud para actualizar un campo del perfil del usuario.
 * @param {FormData} formData - Los datos del formulario.
 * @returns {Promise<object>}
 */
export async function updateProfile(formData) {
    return await request(window.PROJECT_CONFIG.apiUrl, {
        method: 'POST',
        body: formData
    });
}

/**
 * Envía una solicitud para actualizar una preferencia del usuario.
 * @param {FormData} formData - Los datos del formulario.
 * @returns {Promise<object>}
 */
export async function updatePreference(formData) {
    return await request(window.PROJECT_CONFIG.apiUrl, {
        method: 'POST',
        body: formData
    });
}

/**
 * Obtiene los grupos de municipios.
 * @returns {Promise<object>}
 */
export async function getMunicipalityGroups() {
    return await request(`${window.PROJECT_CONFIG.apiUrl}?action=get_municipality_groups`);
}

/**
 * Obtiene los grupos de universidades, opcionalmente filtrados por municipio.
 * @param {string} municipalityId - El ID del municipio para filtrar ('all' para todos).
 * @returns {Promise<object>}
 */
export async function getUniversityGroups(municipalityId) {
    return await request(`${window.PROJECT_CONFIG.apiUrl}?action=get_university_groups&municipality_id=${municipalityId}`);
}

/**
 * Obtiene la lista de municipios para el filtro.
 * @returns {Promise<object>}
 */
export async function getMunicipalities() {
    return await request(`${window.PROJECT_CONFIG.apiUrl}?action=get_municipalities`);
}

/**
 * Obtiene los grupos a los que pertenece el usuario actual.
 * @returns {Promise<object>}
 */
export async function getUserGroups() {
    return await request(`${window.PROJECT_CONFIG.apiUrl}?action=get_user_groups`);
}

/**
 * Obtiene los detalles de un grupo específico.
 * @param {string} groupUuid - El UUID del grupo.
 * @returns {Promise<object>}
 */
export async function getGroupDetails(groupUuid) {
    return await request(`${window.PROJECT_CONFIG.apiUrl}?action=get_group_details&group_uuid=${groupUuid}`);
}

/**
 * Obtiene los miembros de un grupo específico.
 * @param {string} groupUuid - El UUID del grupo.
 * @returns {Promise<object>}
 */
export async function getGroupMembers(groupUuid) {
    return await request(`${window.PROJECT_CONFIG.apiUrl}?action=get_group_members&group_uuid=${groupUuid}`);
}

/**
 * Obtiene un lote de mensajes de un chat.
 * @param {string} groupUuid - El UUID del grupo.
 * @param {number} offset - El número de mensajes a saltar (para paginación).
 * @returns {Promise<object>}
 */
export async function getChatMessages(groupUuid, offset) {
    return await request(`${window.PROJECT_CONFIG.apiUrl}?action=get_chat_messages&group_uuid=${groupUuid}&offset=${offset}`);
}

/**
 * Envía una solicitud para reportar un mensaje.
 * @param {FormData} formData - Los datos del formulario.
 * @returns {Promise<object>}
 */
export async function reportMessage(formData) {
    return await request(window.PROJECT_CONFIG.apiUrl, {
        method: 'POST',
        body: formData
    });
}

/**
 * Obtiene un token para la conexión WebSocket.
 * @param {FormData} formData - Los datos del formulario.
 * @returns {Promise<object>}
 */
export async function getWebSocketToken(formData) {
    return await request(window.PROJECT_CONFIG.wsApiUrl, {
        method: 'POST',
        body: formData
    });
}