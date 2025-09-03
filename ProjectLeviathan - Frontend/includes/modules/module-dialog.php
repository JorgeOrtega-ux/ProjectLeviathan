<div class="module-content module-dialog disabled" data-module="accountActionModal">

    <div class="menu-content dialog-pane disabled" data-dialog="updatePassword">
        <div class="dialog-step active" data-pane="confirmPassword">
            <div class="dialog-header">
                <div class="dialog-icon-background"><span class="material-symbols-rounded">lock_person</span></div>
                <h2>Confirma tu identidad</h2>
                <p>Ingresa tu contraseña actual para continuar.</p>
            </div>
            <div class="dialog-body">
                <div class="input-group">
                    <label for="current-password">Contraseña actual</label>
                    <input type="password" id="current-password" class="edit-input" placeholder="Escribe tu contraseña">
                </div>
                <div class="dialog-error-message"></div>
            </div>
            <div class="dialog-actions">
                <button class="cancel-button" data-action="closeAccountActionModal">Cancelar</button>
                <button class="save-button" data-action="confirmCurrentPassword">Confirmar</button>
            </div>
        </div>

        <div class="dialog-step disabled" data-pane="setNewPassword">
            <div class="dialog-header">
                <div class="dialog-icon-background"><span class="material-symbols-rounded">password</span></div>
                <h2>Crea tu nueva contraseña</h2>
                <p>Asegúrate de que sea segura y fácil de recordar.</p>
            </div>
            <div class="dialog-body">
                <div class="input-group">
                    <label for="new-password">Nueva contraseña</label>
                    <input type="password" id="new-password" class="edit-input" placeholder="Debe tener al menos 8 caracteres">
                </div>
                <div class="input-group">
                    <label for="confirm-password">Confirmar nueva contraseña</label>
                    <input type="password" id="confirm-password" class="edit-input" placeholder="Vuelve a escribir la contraseña">
                </div>
                <div class="dialog-error-message"></div>
            </div>
            <div class="dialog-actions">
                <button class="cancel-button" data-action="closeAccountActionModal">Cancelar</button>
                <button class="save-button" data-action="saveNewPassword">Guardar cambios</button>
            </div>
        </div>
    </div>

    <div class="menu-content dialog-pane disabled" data-dialog="deleteAccount">
        <div class="dialog-header">
            <div class="dialog-icon-background danger"><span class="material-symbols-rounded">warning</span></div>
            <h2>¿Seguro que quieres eliminar tu cuenta?</h2>
            <p>Esta acción es <span class="text-danger">permanente</span> y no se puede deshacer. Todo tu contenido se perderá.</p>
        </div>
        <div class="dialog-body">
            <div class="input-group">
                <label for="delete-confirm-password">Confirma tu contraseña para continuar</label>
                <input type="password" id="delete-confirm-password" class="edit-input" placeholder="Escribe tu contraseña">
            </div>
            <div class="dialog-error-message"></div>
        </div>
        <div class="dialog-actions">
            <button class="cancel-button" data-action="closeAccountActionModal">No, cancelar</button>
            <button class="save-button danger-button" data-action="confirmDeleteAccount">Sí, eliminar cuenta</button>
        </div>
    </div>

    <div class="menu-content dialog-pane disabled" data-dialog="accessCode">
        <div class="dialog-header">
            <div class="dialog-icon-background"><span class="material-symbols-rounded">key</span></div>
            <h2>Este grupo es privado</h2>
            <p>Ingresa el código de acceso para unirte.</p>
        </div>
        <div class="dialog-body">
            <div class="input-group">
                <label for="group-access-code">Código de acceso</label>
                <input type="text" id="group-access-code" class="edit-input" placeholder="XXXX-XXXX-XXXX" maxlength="14">
            </div>
            <div class="dialog-error-message"></div>
        </div>
        <div class="dialog-actions">
            <button class="cancel-button" data-action="closeAccountActionModal">Cancelar</button>
            <button class="save-button" data-action="submitAccessCode">Unirse al grupo</button>
        </div>
    </div>

    <div class="menu-content dialog-pane disabled" data-dialog="reportMessage">
        <div class="dialog-header">
            <div class="dialog-icon-background danger"><span class="material-symbols-rounded">report</span></div>
            <h2>Reportar Mensaje</h2>
            <p>Se enviará una copia de este mensaje para su revisión. El autor del mensaje no sabrá que lo reportaste.</p>
        </div>
        <div class="dialog-body">
            <div class="reported-message-container">
                <p class="reported-message-text"></p>
                <img src="" class="reported-message-image" alt="Imagen a reportar" style="display: none;">
            </div>
            <div class="report-options" style="display: none;">
                <label class="report-checkbox-label">
                    <input type="checkbox" name="report_image" id="report-image-checkbox">
                    <span>Reportar también la imagen</span>
                </label>
            </div>
            <input type="hidden" name="message_id" value="">
            <div class="dialog-error-message"></div>
        </div>
        <div class="dialog-actions">
            <button class="cancel-button" data-action="closeAccountActionModal">Cancelar</button>
            <button class="save-button danger-button" data-action="confirmReport">Reportar</button>
        </div>
    </div>


    <div class="menu-content dialog-pane disabled" data-dialog="confirmDeleteMessage">
        <div class="dialog-header">
            <div class="dialog-icon-background danger"><span class="material-symbols-rounded">delete_forever</span></div>
            <h2>¿Eliminar este mensaje?</h2>
            <p>Esta acción no se puede deshacer. El mensaje se eliminará para todos.</p>
        </div>
        <div class="dialog-body">
            <div class="reported-message-container">
                <p class="reported-message-text" id="message-to-delete-text"></p>
            </div>
            <input type="hidden" name="message_id_to_delete" value="">
        </div>
        <div class="dialog-actions">
            <button class="cancel-button" data-action="closeAccountActionModal">Cancelar</button>
            <button class="save-button danger-button" data-action="confirmDeleteMessageAction">Sí, eliminar</button>
        </div>
    </div>
</div>