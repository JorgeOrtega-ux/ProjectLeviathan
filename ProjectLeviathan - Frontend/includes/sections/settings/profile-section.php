<?php
$userRole = $_SESSION['role'] ?? 'user';
$rankDetails = getRankDetails($userRole);
// --- INICIO DE LA MODIFICACIÓN ---
// Carga las preferencias para usarlas directamente en el HTML.
$prefs = $_SESSION['user_preferences'] ?? [];
// --- FIN DE LA MODIFICACIÓN ---
?>
<div class="section-content overflow-y <?php echo $CURRENT_SUBSECTION === 'profile' ? 'active' : 'disabled'; ?>" data-section="sectionProfile">
    <div class="content-container">
        <div class="card">
            <div class="card-header-container">
                <div class="card-header">
                    <h2>Tu perfil</h2>
                    <p>Administra tu nombre, correo y otros datos de tu cuenta.</p>
                </div>
            </div>
        </div>

        <div class="card">
            <div class="card-item">
                <div class="card-content">
                    <div class="card-info allow-wrap">
                        <strong>Emblema</strong>
                        <span>Este es el emblema que representa tu rango en la plataforma.</span>
                    </div>
                </div>
                <div class="emblem-container">
                    <div class="emblem-wrapper <?php echo htmlspecialchars($rankDetails['class']); ?>">
                        <div class="emblem-content">
                            <span class="material-symbols-rounded"><?php echo htmlspecialchars($rankDetails['icon']); ?></span>
                            <span><?php echo htmlspecialchars($rankDetails['name']); ?></span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="card">
            <div class="card-item with-divider" data-section="name">
                <div class="view-state">
                    <div class="card-content">
                        <div class="card-info">
                            <strong>Nombre de usuario</strong>
                            <span><?php echo htmlspecialchars($_SESSION['username'] ?? 'No disponible'); ?></span>
                        </div>
                    </div>
                    <button class="edit-button" data-action="toggleEditState">Editar</button>
                </div>
                <div class="edit-state hidden">
                    <div class="card-info">
                        <strong>Nombre de usuario</strong>
                        <div class="edit-input-group">
                            <input type="text" class="edit-input" value="<?php echo htmlspecialchars($_SESSION['username'] ?? ''); ?>" maxlength="25">
                            <div class="edit-actions">
                                <button class="cancel-button" data-action="toggleViewState">Cancelar</button>
                                <button class="save-button" data-action="saveProfile" data-field="username">Guardar</button>
                            </div>
                        </div>
                        <span class="edit-error-message" style="color: #d93025; font-size: 0.8rem; margin-top: 4px; display: none;"></span>
                    </div>
                </div>
            </div>
            <div class="card-item with-divider" data-section="email">
                <div class="view-state">
                    <div class="card-content">
                        <div class="card-info">
                            <strong>Correo electrónico</strong>
                            <span><?php echo htmlspecialchars($_SESSION['email'] ?? 'No disponible'); ?></span>
                        </div>
                    </div>
                    <button class="edit-button" data-action="toggleEditState">Editar</button>
                </div>
                <div class="edit-state hidden">
                     <div class="card-info">
                        <strong>Correo electrónico</strong>
                        <div class="edit-input-group">
                            <input type="email" class="edit-input" value="<?php echo htmlspecialchars($_SESSION['email'] ?? ''); ?>" maxlength="126">
                            <div class="edit-actions">
                                <button class="cancel-button" data-action="toggleViewState">Cancelar</button>
                                <button class="save-button" data-action="saveProfile" data-field="email">Guardar</button>
                            </div>
                        </div>
                         <span class="edit-error-message" style="color: #d93025; font-size: 0.8rem; margin-top: 4px; display: none;"></span>
                    </div>
                </div>
            </div>
            <div class="card-item" data-section="phone">
                <div class="view-state">
                    <div class="card-content">
                        <div class="card-info">
                            <strong>Número de teléfono</strong>
                            <span><?php echo htmlspecialchars($_SESSION['phone_number'] ?? 'No disponible'); ?></span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="card">
            <div class="card-item-column" data-preference-field="language">
                <div class="card-info allow-wrap">
                    <strong>Idioma</strong>
                    <span>Elige tu idioma de preferencia para la interfaz.</span>
                </div>
                <div class="control-group">
                    <div class="selector-input" data-action="toggleSelector">
                        <div class="selected-value">
                            <div class="selected-value-icon left">
                                <span class="material-symbols-rounded">language</span>
                            </div>
                            <span class="selected-value-text"></span>
                        </div>
                        <div class="selected-value-icon">
                            <span class="material-symbols-rounded">arrow_drop_down</span>
                        </div>
                    </div>
                    <div class="module-content module-selector body-title disabled" data-module="moduleSelector">
                         <div class="menu-content">
                            <div class="menu-body overflow-y">
                                <div class="menu-list">
                                    <div class="menu-link <?php echo ($prefs['language'] ?? 'es-MX') === 'es-MX' ? 'active' : ''; ?>" data-value="es-MX">
                                        <div class="menu-link-icon"><span class="material-symbols-rounded">language</span></div>
                                        <div class="menu-link-text"><span>Español (México)</span></div>
                                    </div>
                                    <div class="menu-link <?php echo ($prefs['language'] ?? '') === 'en-US' ? 'active' : ''; ?>" data-value="en-US">
                                        <div class="menu-link-icon"><span class="material-symbols-rounded">language</span></div>
                                        <div class="menu-link-text"><span>English (United States)</span></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="card">
            <div class="card-item-column" data-preference-field="usage_type">
                <div class="card-info allow-wrap">
                    <strong>¿Para qué usarás esta web?</strong>
                </div>
                <div class="control-group">
                    <div class="selector-input" data-action="toggleSelector">
                        <div class="selected-value">
                            <div class="selected-value-icon left">
                                <span class="material-symbols-rounded"></span>
                            </div>
                            <span class="selected-value-text"></span>
                        </div>
                        <div class="selected-value-icon">
                            <span class="material-symbols-rounded">arrow_drop_down</span>
                        </div>
                    </div>
                    <div class="module-content module-selector body-title disabled" data-module="moduleSelector">
                        <div class="menu-content">
                            <div class="menu-body overflow-y">
                                <div class="menu-list">
                                    <div class="menu-link <?php echo ($prefs['usage_type'] ?? 'personal') === 'personal' ? 'active' : ''; ?>" data-value="personal">
                                        <div class="menu-link-icon"><span class="material-symbols-rounded">person</span></div>
                                        <div class="menu-link-text"><span>Uso personal</span></div>
                                    </div>
                                    <div class="menu-link <?php echo ($prefs['usage_type'] ?? '') === 'commercial' ? 'active' : ''; ?>" data-value="commercial">
                                        <div class="menu-link-icon"><span class="material-symbols-rounded">storefront</span></div>
                                        <div class="menu-link-text"><span>Uso comercial</span></div>
                                    </div>
                                    <div class="menu-link <?php echo ($prefs['usage_type'] ?? '') === 'educational' ? 'active' : ''; ?>" data-value="educational">
                                        <div class="menu-link-icon"><span class="material-symbols-rounded">school</span></div>
                                        <div class="menu-link-text"><span>Uso educativo</span></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="control-group">
                    <div class="info-box">
                        <p>Estamos personalizando tu experiencia para que se adapte mejor a tus necesidades. Puedes cambiar esta configuración en cualquier momento.</p>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="card">
            <div class="card-item with-divider toggle-item" data-preference-field="open_links_in_new_tab">
                <div class="card-content">
                    <div class="card-info allow-wrap">
                        <strong>Abrir los enlaces en una pestaña nueva</strong>
                        <span>En el navegador web, los enlaces siempre se abrirán en una pestaña nueva.</span>
                    </div>
                </div>
                <label class="toggle-switch">
                    <input type="checkbox" <?php echo !empty($prefs['open_links_in_new_tab']) ? 'checked' : ''; ?>>
                    <span class="toggle-slider"></span>
                    <span class="material-symbols-rounded">done</span>
                </label>
            </div>
            <div class="card-item toggle-item" data-preference-field="show_sensitive_content">
                <div class="card-content">
                    <div class="card-info allow-wrap">
                        <strong>Mostrar contenido sensible</strong>
                        <span>Permite la visualización de contenido que puede incluir lenguaje fuerte o temas para un público maduro.</span>
                    </div>
                </div>
                <label class="toggle-switch">
                    <input type="checkbox" <?php echo !empty($prefs['show_sensitive_content']) ? 'checked' : ''; ?>>
                    <span class="toggle-slider"></span>
                    <span class="material-symbols-rounded">done</span>
                </label>
            </div>
        </div>
    </div>
</div>