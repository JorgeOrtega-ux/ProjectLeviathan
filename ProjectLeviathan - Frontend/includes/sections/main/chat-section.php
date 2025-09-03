<div class="section-content disabled" data-section="sectionChat">

    <div class="chat-messages-wrapper" id="chat-messages-wrapper">
        <div id="chat-initial-loader" style="display: none;">
            <div class="loader"></div>
        </div>
        <div class="chat-loader-container" id="chat-loader-container" style="display: none;">
            <div class="loader"></div>
        </div>
        <div class="chat-welcome-message" id="chat-welcome-message" style="display: none;">
            <span class="material-symbols-rounded chat-welcome-icon">waving_hand</span>
            <h2>¡Empieza la conversación!</h2>
            <p>Aún no hay mensajes en este chat. ¡Sé el primero en enviar uno!</p>
        </div>
        <div class="chat-messages-container" id="chat-messages-container">
        </div>
    </div>

    <div class="chat-input-area">
        <div class="content-container">
            <div class="chat-input-container">
                <div class="mention-container disabled" id="mention-container">
                    <div class="mention-list" id="mention-list"></div>
                </div>
                
                <form class="chat-input-group" id="chat-form">
                    <textarea class="chat-input-field" placeholder="Envía un mensaje a la comunidad" autocomplete="off" maxlength="500" rows="1"></textarea>
                    
                    <div class="chat-input-toolbar">
                        <button type="button" class="chat-attach-button" data-action="toggle-attach-dropdown">
                            <span class="material-symbols-rounded">add</span>
                        </button>
                        <button type="submit" class="chat-send-button">
                            <span class="material-symbols-rounded">send</span>
                        </button>
                    </div>
                    <input type="file" id="image-input" accept="image/*" style="display: none;">
                </form>

                <div class="module-content module-options body-title disabled" id="attach-dropdown-template">
                    <div class="menu-content">
                        <div class="menu-body">
                            <div class="menu-list">
                                <div class="menu-link" data-action="attach-photo">
                                    <div class="menu-link-icon"><span class="material-symbols-rounded">image</span></div>
                                    <div class="menu-link-text"><span>Adjuntar foto</span></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    
    <div class="module-content module-options body-title disabled" id="message-options-template" style="display: none;">
        <div class="menu-content">
            <div class="menu-body">
                <div class="menu-list">
                    <div class="menu-link" data-action="reply-message">
                        <div class="menu-link-icon"><span class="material-symbols-rounded">reply</span></div>
                        <div class="menu-link-text"><span>Responder</span></div>
                    </div>
                    <div class="menu-link" data-action="copy-message">
                        <div class="menu-link-icon"><span class="material-symbols-rounded">content_copy</span></div>
                        <div class="menu-link-text"><span>Copiar</span></div>
                    </div>
                    <div class="menu-link" data-action="delete-message" style="display: none; color: #d93025;">
                        <div class="menu-link-icon"><span class="material-symbols-rounded">delete</span></div>
                        <div class="menu-link-text"><span>Eliminar</span></div>
                    </div>
                    <div class="menu-link" data-action="report-message">
                        <div class="menu-link-icon"><span class="material-symbols-rounded">report</span></div>
                        <div class="menu-link-text"><span>Reportar</span></div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>