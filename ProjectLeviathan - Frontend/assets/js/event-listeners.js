// /ProjectLeviathan - Frontend/assets/js/event-listeners.js

function setupEventListeners(
    // DOM Elements
    {
        toggleOptionsButton, moduleOptions, toggleSurfaceButton, moduleSurface,
        homeGrid, chatMessagesWrapper, chatForm, chatInput, imageInput, mentionContainer,
        mentionList, usernameInput, exploreTabs, searchInput, loadMoreMunicipalitiesButton,
        loadMoreUniversitiesButton, discoveryContent, submitAccessCodeButton,
        groupAccessCodeInput, generalContentTop, scrollableSections,
        openUpdatePasswordModalButton, openDeleteAccountModalButton,
        closeAccountActionModalButtons, confirmCurrentPasswordButton, saveNewPasswordButton,
        confirmDeleteAccountButton, toggleSectionHomeButtons, toggleSectionExploreButtons,
        toggleChatMessagesButton, toggleChatMembersButton, toggleSectionSettingsButton,
        logoutButton, toggleSectionHomeFromSettingsButton,
        toggleSectionProfileButton, toggleSectionLoginButton, toggleSectionAccessibilityButton,
        themeMediaQuery, accountActionModal, municipalitiesGrid, universitiesGrid
    },
    // State & Variables
    state,
    // Handlers & Functions
    handlers
) {
    toggleOptionsButton.addEventListener('click', (e) => {
        e.stopPropagation();
        if (moduleOptions.classList.contains('active')) {
            handlers.closeMenuOptions();
        } else {
            handlers.openMenuOptions();
        }
    });

    toggleSurfaceButton.addEventListener('click', (e) => {
        e.stopPropagation();
        if (moduleSurface.classList.contains('active')) {
            handlers.closeMenuSurface();
        } else {
            handlers.openMenuSurface();
        }
    });

    // --- INICIO DE LA MODIFICACIÓN ---
    const handleGroupMembershipToggle = (e) => {
        const joinButton = e.target.closest('.community-card-button');
        if (!joinButton) return;

        const card = joinButton.closest('.community-card');
        const groupUuid = card.dataset.groupUuid;
        const groupType = card.dataset.groupType;

        // Si se hace clic en "Ver", navega al chat
        if (joinButton.classList.contains('view')) {
            const groupTitle = card.querySelector('.community-card-title').textContent;
            if (groupUuid && groupTitle) {
                handlers.handleNavigationChange('chat', { uuid: groupUuid, title: groupTitle, type: 'messages' });
            }
            return;
        }

        const privacy = joinButton.dataset.privacy;

        if (privacy === 'private' && !joinButton.classList.contains('leave')) {
            const accessCodeDialog = document.querySelector('[data-dialog="accessCode"]');
            if (accessCodeDialog) {
                accessCodeDialog.dataset.groupUuid = groupUuid;
                accessCodeDialog.dataset.groupType = groupType;
                handlers.openAccountActionModal('accessCode');
            }
            return;
        }

        const formData = new FormData();
        formData.append('action', 'toggle_group_membership');
        formData.append('group_uuid', groupUuid);
        formData.append('group_type', groupType);
        formData.append('csrf_token', window.PROJECT_CONFIG.csrfToken);

        fetch(window.PROJECT_CONFIG.apiUrl, {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(result => {
            if (result.success) {
                const memberCountSpan = card.querySelector('[data-member-count]');
                if (memberCountSpan) {
                    memberCountSpan.textContent = result.newMemberCount;
                }

                const cardFooter = card.querySelector('.community-card-actions');
                let newButtonsHTML = '';

                if (result.action === 'joined') {
                    newButtonsHTML = `
                        <button class="community-card-button leave" data-privacy="${privacy}">
                            <span class="material-symbols-rounded">door_open</span>
                            <span>Abandonar</span>
                        </button>
                        <button class="community-card-button view">
                            <span class="material-symbols-rounded">visibility</span>
                            <span>Ver</span>
                        </button>
                    `;
                } else if (result.action === 'left') {
                    newButtonsHTML = `
                        <button class="community-card-button join" data-privacy="${privacy}">
                            <span class="material-symbols-rounded">group_add</span>
                            <span>Unirse</span>
                        </button>
                    `;
                }
                
                if (cardFooter) {
                    cardFooter.innerHTML = newButtonsHTML;
                }

                handlers.refreshHomeView();

            } else {
                alert(result.message || 'Ocurrió un error.');
            }
        })
        .catch(() => alert('Error de conexión.'));
    };

    if (homeGrid) {
        homeGrid.addEventListener('click', handleGroupMembershipToggle);

        const homeTabs = document.getElementById('home-tabs');
        if (homeTabs) {
            homeTabs.addEventListener('click', async (e) => {
                const tabItem = e.target.closest('.tab-item');
                if (!tabItem || tabItem.classList.contains('active')) return;

                homeTabs.querySelectorAll('.tab-item').forEach(tab => tab.classList.remove('active'));
                tabItem.classList.add('active');

                const targetTab = tabItem.dataset.tab;
                if (targetTab === 'my-communities') {
                    try {
                        const response = await fetch(`${window.PROJECT_CONFIG.apiUrl}?action=get_user_groups`);
                        const data = await response.json();
                        if (data.success && data.groups.length > 0) {
                            handlers.renderDashboardView(data.groups);
                        } else {
                            handlers.renderDiscoveryView();
                        }
                    } catch (error) {
                        console.error("Error loading user groups, showing discovery view.", error);
                        handlers.renderDiscoveryView();
                    }
                } else if (targetTab === 'recommendations') {
                    try {
                        const response = await fetch(`${window.PROJECT_CONFIG.apiUrl}?action=get_recommended_groups`);
                        const data = await response.json();
                        if (data.success) {
                            handlers.renderGroupCards(data.groups, homeGrid);
                        } else {
                            homeGrid.innerHTML = `<p>${data.message || 'Error al cargar recomendaciones.'}</p>`;
                        }
                    } catch (error) {
                        homeGrid.innerHTML = '<p>Error de conexión.</p>';
                    }
                } else if (targetTab === 'trending') {
                    try {
                        const response = await fetch(`${window.PROJECT_CONFIG.apiUrl}?action=get_trending_groups`);
                        const data = await response.json();
                        if (data.success) {
                            handlers.renderGroupCards(data.groups, homeGrid);
                        } else {
                            homeGrid.innerHTML = `<p>${data.message || 'Error al cargar tendencias.'}</p>`;
                        }
                    } catch (error) {
                        homeGrid.innerHTML = '<p>Error de conexión.</p>';
                    }
                }
            });
        }
    }

    if (discoveryContent) {
        discoveryContent.addEventListener('click', handleGroupMembershipToggle);
    }
    // --- FIN DE LA MODIFICACIÓN ---

    if (chatMessagesWrapper) {
        chatMessagesWrapper.addEventListener('click', (e) => {
            const messageBubble = e.target.closest('.message-bubble');
            if (messageBubble) {
                e.stopPropagation();
                const isAlreadyActive = messageBubble.classList.contains('active');
                handlers.closeAllModules();
                if (!isAlreadyActive) {
                    handlers.openMessageOptions(messageBubble);
                }
            }
        });
    }

    document.body.addEventListener('click', (e) => {
        const attachButton = e.target.closest('[data-action="toggle-attach-dropdown"]');
        if (attachButton) {
            e.stopPropagation();
            handlers.openAttachDropdown(attachButton);
        }

        const attachPhoto = e.target.closest('[data-action="attach-photo"]');
        if (attachPhoto) {
            e.stopPropagation();
            document.getElementById('image-input').click();
            handlers.closeAttachDropdown();
        }

        const replyButton = e.target.closest('[data-action="reply-message"]');
        if (replyButton) {
            e.stopPropagation();
            const messageBubble = document.querySelector('.message-bubble.active');
            if (messageBubble) {
                const messageId = messageBubble.dataset.messageId;
                const author = messageBubble.querySelector('.message-info').textContent;
                const textElement = messageBubble.querySelector('.message-content p');
                const text = textElement ? textElement.textContent.trim() : '';
                const imageElement = messageBubble.querySelector(':scope > img');
                const imageUrl = imageElement ? imageElement.src : null;

                state.currentReplyMessageId = messageId;
                
                const chatForm = document.getElementById('chat-form');
                let previewsWrapper = chatForm.querySelector('.chat-previews-wrapper');
                if (!previewsWrapper) {
                    previewsWrapper = document.createElement('div');
                    previewsWrapper.className = 'chat-previews-wrapper';
                    chatForm.insertBefore(previewsWrapper, chatForm.firstChild);
                }

                let replyPreviewContainer = previewsWrapper.querySelector('#reply-preview-container');
                if(!replyPreviewContainer) {
                    replyPreviewContainer = document.createElement('div');
                    replyPreviewContainer.id = 'reply-preview-container';
                    replyPreviewContainer.className = 'reply-preview-container';
                    replyPreviewContainer.innerHTML = `
                        <img src="" class="reply-preview-image" alt="Vista previa de respuesta">
                        <div class="reply-preview-content">
                            <strong class="reply-preview-author"></strong>
                            <p class="reply-preview-text"></p>
                        </div>
                        <button class="reply-preview-close" data-action="cancel-reply">
                            <span class="material-symbols-rounded">close</span>
                        </button>
                    `;
                    previewsWrapper.appendChild(replyPreviewContainer);
                }


                const previewText = replyPreviewContainer.querySelector('.reply-preview-text');
                const previewImage = replyPreviewContainer.querySelector('.reply-preview-image');

                replyPreviewContainer.querySelector('.reply-preview-author').textContent = author;

                if (imageUrl) {
                    previewImage.src = imageUrl;
                    previewImage.style.display = 'block';
                } else {
                    previewImage.style.display = 'none';
                }

                if (text) {
                    previewText.textContent = text;
                    previewText.style.display = 'block';
                } else {
                    previewText.textContent = '';
                    previewText.style.display = 'none';
                }

                replyPreviewContainer.classList.remove('disabled');
                replyPreviewContainer.classList.add('active');

                document.querySelector('.chat-input-field').focus();
            }
            handlers.closeMessageOptions();
        }

        const cancelReplyButton = e.target.closest('[data-action="cancel-reply"]');
        if (cancelReplyButton) {
            state.currentReplyMessageId = null;
            const previewContainer = document.getElementById('reply-preview-container');
            if (previewContainer) {
                const previewsWrapper = previewContainer.parentElement;
                previewContainer.remove();
                if (previewsWrapper && !previewsWrapper.hasChildNodes()) {
                    previewsWrapper.remove();
                }
            }
        }

        const cancelImagePreviewButton = e.target.closest('[data-action="cancel-image-preview"]');
        if (cancelImagePreviewButton) {
            state.currentImageFile = null;
            const previewContainer = document.getElementById('image-preview-container');
            if (previewContainer) {
                const previewsWrapper = previewContainer.parentElement;
                previewContainer.remove();
                if (previewsWrapper && !previewsWrapper.hasChildNodes()) {
                    previewsWrapper.remove();
                }
            }
            document.getElementById('image-input').value = '';
        }

        const reportButton = e.target.closest('[data-action="report-message"]');
        if (reportButton) {
            e.stopPropagation();
            const messageBubble = document.querySelector('.message-bubble.active');
            if (messageBubble) {
                const messageId = messageBubble.dataset.messageId;
                const textElement = messageBubble.querySelector('.message-content p');
                const messageText = textElement ? textElement.textContent.trim() : '';
                const imageElement = messageBubble.querySelector(':scope > img');
                const imageUrl = imageElement ? imageElement.src : null;
        
                const reportDialog = document.querySelector('[data-dialog="reportMessage"]');
                if (reportDialog) {
                    reportDialog.querySelector('input[name="message_id"]').value = messageId;
                    const reportTextElement = reportDialog.querySelector('.reported-message-text');
                    const reportImage = reportDialog.querySelector('.reported-message-image');
                    const reportOptions = reportDialog.querySelector('.report-options');
                    const reportCheckbox = reportDialog.querySelector('#report-image-checkbox');
        
                    // --- INICIO DE LA MODIFICACIÓN ---
                    // Resetear la visibilidad de los elementos del modal
                    reportTextElement.style.display = 'none';
                    reportImage.style.display = 'none';
                    reportOptions.style.display = 'none';
                    reportCheckbox.checked = false;
        
                    if (imageUrl) {
                        reportImage.src = imageUrl;
                        reportImage.style.display = 'block';
                        // Por defecto, si hay una imagen, se reporta.
                        reportCheckbox.checked = true;
                        
                        if (messageText) {
                            // Si hay texto Y una imagen, mostrar el texto y la opción del checkbox.
                            reportTextElement.textContent = messageText;
                            reportTextElement.style.display = 'block';
                            reportOptions.style.display = 'block';
                        } else {
                            // Si SOLO hay una imagen, ocultar el contenedor del texto y el checkbox.
                            reportTextElement.textContent = ''; 
                            reportOptions.style.display = 'none';
                        }
                    } else if (messageText) {
                        // Si SOLO hay texto, mostrarlo y ocultar todo lo relacionado con la imagen.
                        reportTextElement.textContent = messageText;
                        reportTextElement.style.display = 'block';
                    }
                    // --- FIN DE LA MODIFICACIÓN ---
        
                    handlers.closeAllModules();
                    handlers.openAccountActionModal('reportMessage');
                }
            }
        }

        const deleteButton = e.target.closest('[data-action="delete-message"]');
        if (deleteButton) {
            e.stopPropagation();
            const messageBubble = document.querySelector('.message-bubble.active');
            if (messageBubble) {
                const messageId = messageBubble.dataset.messageId;
                const messageText = messageBubble.querySelector('.message-content p').textContent;
                const confirmDialog = document.querySelector('[data-dialog="confirmDeleteMessage"]');

                if (confirmDialog) {
                    confirmDialog.querySelector('#message-to-delete-text').textContent = messageText;
                    confirmDialog.querySelector('input[name="message_id_to_delete"]').value = messageId;
                    handlers.closeAllModules();
                    handlers.openAccountActionModal('confirmDeleteMessage');
                }
            }
        }

        const confirmDeleteMessageButton = e.target.closest('[data-action="confirmDeleteMessageAction"]');
        if (confirmDeleteMessageButton) {
            const dialog = confirmDeleteMessageButton.closest('[data-dialog="confirmDeleteMessage"]');
            if (dialog) {
                const messageId = dialog.querySelector('input[name="message_id_to_delete"]').value;
                if (state.websocket && state.websocket.readyState === WebSocket.OPEN) {
                    const messageData = {
                        type: 'delete_message',
                        message_id: parseInt(messageId, 10)
                    };
                    state.websocket.send(JSON.stringify(messageData));
                }
                handlers.closeAccountActionModal();
            }
        }

        const confirmReportButton = e.target.closest('[data-action="confirmReport"]');
        if (confirmReportButton) {
            const reportDialog = confirmReportButton.closest('[data-dialog="reportMessage"]');
            if (reportDialog) {
                const messageId = reportDialog.querySelector('input[name="message_id"]').value;
                const reportImageCheckbox = reportDialog.querySelector('#report-image-checkbox');
                const shouldReportImage = reportImageCheckbox.checked && reportDialog.querySelector('.reported-message-image').style.display !== 'none';
                handlers.reportMessage(messageId, shouldReportImage);
            }
        }

        const copyButton = e.target.closest('[data-action="copy-message"]');
        if (copyButton) {
            e.stopPropagation();
            const messageBubble = document.querySelector('.message-bubble.active');
            if (messageBubble) {
                const messageText = messageBubble.querySelector('.message-content p').textContent;
                if (navigator.clipboard && window.isSecureContext) {
                    navigator.clipboard.writeText(messageText).catch(err => {
                        console.error('Error al copiar el texto con la API moderna: ', err);
                    });
                } else {
                    const textArea = document.createElement("textarea");
                    textArea.value = messageText;
                    textArea.style.position = "fixed";
                    textArea.style.left = "-9999px";
                    document.body.appendChild(textArea);
                    textArea.focus();
                    textArea.select();
                    try {
                        document.execCommand('copy');
                    } catch (err) {
                        console.error('Error al copiar el texto con el método de fallback: ', err);
                    }
                    document.body.removeChild(textArea);
                }
                handlers.closeMessageOptions();
            }
        }
    });

    const handleInputSizing = (target) => {
        target.style.height = 'auto';
        target.style.height = `${target.scrollHeight}px`;
    };

    if (chatInput) {
        chatInput.addEventListener('input', (e) => {
            handleInputSizing(e.target);
        });
    }

    if (imageInput) {
        imageInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                state.currentImageFile = file;
                const reader = new FileReader();
                reader.onload = (event) => {
                    
                    const chatForm = document.getElementById('chat-form');
                    let previewsWrapper = chatForm.querySelector('.chat-previews-wrapper');
                    if (!previewsWrapper) {
                        previewsWrapper = document.createElement('div');
                        previewsWrapper.className = 'chat-previews-wrapper';
                        chatForm.insertBefore(previewsWrapper, chatForm.firstChild);
                    }
    
                    let imagePreviewContainer = previewsWrapper.querySelector('#image-preview-container');
                    if(!imagePreviewContainer) {
                        imagePreviewContainer = document.createElement('div');
                        imagePreviewContainer.id = 'image-preview-container';
                        imagePreviewContainer.className = 'image-preview-container';
                        imagePreviewContainer.innerHTML = `
                            <img src="" alt="Vista previa de la imagen" id="image-preview">
                            <button class="image-preview-close" data-action="cancel-image-preview">
                                <span class="material-symbols-rounded">close</span>
                            </button>
                        `;
                        previewsWrapper.appendChild(imagePreviewContainer);
                    }

                    imagePreviewContainer.querySelector('#image-preview').src = event.target.result;
                    imagePreviewContainer.classList.remove('disabled');
                };
                reader.readAsDataURL(file);
            }
        });
    }

    if (chatForm && chatInput && mentionContainer && mentionList) {
        chatInput.addEventListener('input', () => {
            const value = chatInput.value;
            const lastAtIndex = value.lastIndexOf('@');

            if (lastAtIndex !== -1 && (lastAtIndex === 0 || /\s/.test(value[lastAtIndex - 1]))) {
                const searchTerm = value.substring(lastAtIndex + 1);
                const filteredMembers = state.allChatMembers.filter(member =>
                    member.username.toLowerCase().includes(searchTerm.toLowerCase()) && member.id !== window.PROJECT_CONFIG.userId
                );

                if (filteredMembers.length > 0) {
                    mentionContainer.classList.remove('disabled');
                    mentionList.innerHTML = '';
                    filteredMembers.forEach(member => {
                        const item = document.createElement('div');
                        item.className = 'mention-item';
                        item.dataset.username = member.username;
                        item.innerHTML = `
                            <div class="card-info">
                                <strong>${member.username}</strong>
                                <span class="mention-item-role">${member.role.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                            </div>
                        `;
                        mentionList.appendChild(item);
                    });
                } else {
                    mentionContainer.classList.add('disabled');
                }
            } else {
                mentionContainer.classList.add('disabled');
            }
        });

        mentionList.addEventListener('click', (e) => {
            const item = e.target.closest('.mention-item');
            if (item) {
                const username = item.dataset.username;
                const value = chatInput.value;
                const lastAtIndex = value.lastIndexOf('@');

                chatInput.value = value.substring(0, lastAtIndex) + `@${username} `;
                mentionContainer.classList.add('disabled');
                chatInput.focus();
            }
        });
        chatForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const message = chatInput.value.trim();
            let imageUrl = null;

            if (state.currentImageFile) {
                const formData = new FormData();
                formData.append('action', 'upload_image');
                formData.append('image', state.currentImageFile);
                formData.append('group_uuid', state.currentChatGroupUUID);
                formData.append('csrf_token', window.PROJECT_CONFIG.csrfToken);

                try {
                    const response = await fetch(window.PROJECT_CONFIG.apiUrl, {
                        method: 'POST',
                        body: formData
                    });
                    const result = await response.json();
                    if (result.success) {
                        imageUrl = result.image_url;
                    } else {
                        alert(`Error al subir la imagen: ${result.message}`);
                        return;
                    }
                } catch (error) {
                    alert('Error de conexión al subir la imagen.');
                    return;
                }
            }

            if ((message || imageUrl) && state.websocket && state.websocket.readyState === WebSocket.OPEN) {
                const messageData = {
                    type: 'chat_message',
                    message: message,
                    image_url: imageUrl,
                    reply_to_message_id: state.currentReplyMessageId
                };
                state.websocket.send(JSON.stringify(messageData));
                chatInput.value = '';
                
                handleInputSizing(chatInput);

                state.currentImageFile = null;
                const imagePreviewContainer = document.getElementById('image-preview-container');
                if (imagePreviewContainer) {
                    const previewsWrapper = imagePreviewContainer.parentElement;
                    imagePreviewContainer.remove();
                    if(previewsWrapper && !previewsWrapper.hasChildNodes()) {
                        previewsWrapper.remove();
                    }
                }

                document.getElementById('image-input').value = '';
                state.currentReplyMessageId = null;
                const replyPreviewContainer = document.getElementById('reply-preview-container');
                if (replyPreviewContainer) {
                    const previewsWrapper = replyPreviewContainer.parentElement;
                    replyPreviewContainer.remove();
                    if(previewsWrapper && !previewsWrapper.hasChildNodes()) {
                        previewsWrapper.remove();
                    }
                }
            }
        });
    }

    if (usernameInput) {
        usernameInput.addEventListener('input', (e) => {
            e.target.value = e.target.value.replace(/[^a-zA-Z0-9_]/g, '');
        });
    }

    if (exploreTabs) {
        exploreTabs.addEventListener('click', (e) => {
            const tabItem = e.target.closest('.tab-item');
            if (!tabItem || tabItem.classList.contains('active')) return;
            const targetTab = tabItem.dataset.tab;
            handlers.handleNavigationChange('explore', targetTab);
        });
    }

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            document.querySelectorAll('.community-card').forEach(card => {
                const groupName = card.dataset.groupName;
                card.style.display = groupName.includes(searchTerm) ? 'flex' : 'none';
            });
        });
    }

    if (loadMoreMunicipalitiesButton) {
        loadMoreMunicipalitiesButton.addEventListener('click', () => {
            state.displayedMunicipalitiesCount += state.ITEMS_PER_PAGE;
            handlers.displayGroups(state.allMunicipalities, municipalitiesGrid, state.displayedMunicipalitiesCount, loadMoreMunicipalitiesButton);
        });
    }

    if (loadMoreUniversitiesButton) {
        loadMoreUniversitiesButton.addEventListener('click', () => {
            state.displayedUniversitiesCount += state.ITEMS_PER_PAGE;
            handlers.displayGroups(state.allUniversities, universitiesGrid, state.displayedUniversitiesCount, loadMoreUniversitiesButton);
        });
    }

    document.querySelectorAll('[data-action="toggleSelector"]').forEach((button, index) => {
        const parentControlGroup = button.closest('.control-group, .explore-control-group');
        if (!parentControlGroup) return;

        const selectorDropdown = parentControlGroup.querySelector('[data-module="moduleSelector"]');
        if (!selectorDropdown) return;

        if (!selectorDropdown.id) {
            selectorDropdown.id = `selector-dropdown-${index}`;
        }
        const popperId = selectorDropdown.id;
        button.setAttribute('aria-controls', popperId);

        button.addEventListener('click', (e) => {
            e.stopPropagation();
            const isAlreadyActive = selectorDropdown.classList.contains('active');

            if (!state.allowMultipleActiveModules) {
                handlers.closeAllModules();
            }

            if (isAlreadyActive) {
                handlers.closeAllSelectors();
            } else {
                selectorDropdown.classList.remove('disabled');
                selectorDropdown.classList.add('active');
                button.classList.add('active');

                state.popperInstances[popperId] = Popper.createPopper(button, selectorDropdown, {
                    placement: 'bottom-start',
                    modifiers: [{ name: 'offset', options: { offset: [0, 8] } }],
                });
            }
        });

        selectorDropdown.addEventListener('click', (e) => {
            const link = e.target.closest('.menu-link');
            if (!link) return;

            const newTextSpan = link.querySelector('.menu-link-text span');
            const newText = newTextSpan ? newTextSpan.textContent : '';

            if (button.querySelector('.selected-value-text')) {
                button.querySelector('.selected-value-text').textContent = newText;
            }

            const newIcon = link.querySelector('.menu-link-icon .material-symbols-rounded');
            const selectedValueIconLeft = button.querySelector('.selected-value-icon.left .material-symbols-rounded');
            if (selectedValueIconLeft && newIcon) {
                selectedValueIconLeft.textContent = newIcon.textContent;
            }

            selectorDropdown.querySelectorAll('.menu-link').forEach(l => l.classList.remove('active'));
            link.classList.add('active');

            const parentItem = button.closest('[data-preference-field]');
            if (parentItem) {
                const preferenceField = parentItem.dataset.preferenceField;
                const newValue = link.dataset.value;
                handlers.handlePreferenceUpdate(preferenceField, newValue);
                if (preferenceField === 'theme') {
                    handlers.applyTheme(newValue);
                }
            }

            if (button.id === 'university-municipality-selector-button') {
                const municipalityId = link.dataset.value;
                handlers.loadUniversityGroups(municipalityId);
            }

            handlers.closeAllSelectors();
        });
    });

    if (submitAccessCodeButton) {
        submitAccessCodeButton.addEventListener('click', async () => {
            const accessCodeDialog = document.querySelector('[data-dialog="accessCode"]');
            const groupUuid = accessCodeDialog.dataset.groupUuid;
            const groupType = accessCodeDialog.dataset.groupType;
            const accessCodeInput = document.getElementById('group-access-code');
            const errorContainer = accessCodeDialog.querySelector('.dialog-error-message');

            const formData = new FormData();
            formData.append('action', 'join_private_group');
            formData.append('group_uuid', groupUuid);
            formData.append('group_type', groupType);
            formData.append('access_code', accessCodeInput.value);
            formData.append('csrf_token', window.PROJECT_CONFIG.csrfToken);

            try {
                const response = await fetch(window.PROJECT_CONFIG.apiUrl, {
                    method: 'POST',
                    body: formData
                });
                const result = await response.json();

                if (result.success) {
                    handlers.closeAccountActionModal();
                    const card = document.querySelector(`.community-card[data-group-uuid="${groupUuid}"]`);
                    if (card) {
                        const memberCountSpan = card.querySelector('[data-member-count]');
                        const cardFooter = card.querySelector('.community-card-actions');
                        memberCountSpan.textContent = `${result.newMemberCount}`;

                        if (cardFooter) {
                            cardFooter.innerHTML = `
                                <button class="community-card-button leave" data-privacy="private">
                                    <span class="material-symbols-rounded">door_open</span>
                                    <span>Abandonar</span>
                                </button>
                                <button class="community-card-button view">
                                    <span class="material-symbols-rounded">visibility</span>
                                    <span>Ver</span>
                                </button>
                            `;
                        }
                    }
                    handlers.refreshHomeView();
                } else {
                    errorContainer.textContent = result.message || 'Ocurrió un error.';
                    errorContainer.style.display = 'block';
                }
            } catch (error) {
                errorContainer.textContent = 'Error de conexión.';
                errorContainer.style.display = 'block';
            }
        });
    }

    if (groupAccessCodeInput) {
        groupAccessCodeInput.addEventListener('input', (e) => {
            const input = e.target;
            let value = input.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
            let formattedValue = '';
            if (value.length > 0) {
                formattedValue = value.match(/.{1,4}/g).join('-');
            }
            input.value = formattedValue;
        });
    }

    document.querySelectorAll('.toggle-switch input[type="checkbox"]').forEach(toggle => {
        toggle.addEventListener('change', (e) => {
            const parentItem = e.target.closest('.card-item');
            if (parentItem && parentItem.dataset.preferenceField) {
                const field = parentItem.dataset.preferenceField;
                const value = e.target.checked;
                handlers.handlePreferenceUpdate(field, value);
            }
        });
    });

    document.querySelectorAll('[data-action="toggleEditState"]').forEach(button => {
        button.addEventListener('click', (e) => {
            const parent = e.target.closest('.card-item');
            parent.querySelector('.view-state').classList.add('hidden');
            parent.querySelector('.edit-state').classList.remove('hidden');
        });
    });

    document.querySelectorAll('[data-action="toggleViewState"]').forEach(button => {
        button.addEventListener('click', (e) => {
            const parent = e.target.closest('.card-item');
            parent.querySelector('.edit-state').classList.add('hidden');
            parent.querySelector('.view-state').classList.remove('hidden');
            const errorSpan = parent.querySelector('.edit-error-message');
            if (errorSpan) {
                errorSpan.style.display = 'none';
                errorSpan.textContent = '';
            }
        });
    });

    document.querySelectorAll('[data-action="saveProfile"]').forEach(button => {
        button.addEventListener('click', (e) => {
            handlers.handleProfileUpdate(e.target);
        });
    });

    scrollableSections.forEach(section => {
        section.addEventListener('scroll', () => {
            if (generalContentTop) {
                generalContentTop.classList.toggle('shadow', section.scrollTop > 0);
            }
        });
    });

    if (openUpdatePasswordModalButton) {
        openUpdatePasswordModalButton.addEventListener('click', () => handlers.openAccountActionModal('updatePassword'));
    }
    if (openDeleteAccountModalButton) {
        openDeleteAccountModalButton.addEventListener('click', () => handlers.openAccountActionModal('deleteAccount'));
    }
    closeAccountActionModalButtons.forEach(button => {
        button.addEventListener('click', handlers.closeAccountActionModal);
    });

    if (confirmCurrentPasswordButton) {
        confirmCurrentPasswordButton.addEventListener('click', handlers.showNewPasswordPane);
    }

    if (saveNewPasswordButton) {
        saveNewPasswordButton.addEventListener('click', handlers.saveNewPassword);
    }

    if (confirmDeleteAccountButton) {
        confirmDeleteAccountButton.addEventListener('click', handlers.handleDeleteAccount);
    }

    if (toggleSectionHomeButtons) {
        toggleSectionHomeButtons.forEach(button => {
            button.addEventListener('click', () => {
                handlers.handleNavigationChange('home');
            });
        });
    }

    if (toggleSectionExploreButtons) {
        toggleSectionExploreButtons.forEach(button => {
            button.addEventListener('click', () => {
                if (!state.isSectionExploreActive) handlers.handleNavigationChange('explore', 'municipalities');
            });
        });
    }

    if (toggleChatMessagesButton) {
        toggleChatMessagesButton.addEventListener('click', () => {
            if (!state.isChatMessagesActive && state.activeChatGroup) {
                state.activeChatGroup.type = 'messages';
                handlers.handleNavigationChange('chat', state.activeChatGroup);
            }
        });
    }

    if (toggleChatMembersButton) {
        toggleChatMembersButton.addEventListener('click', () => {
            if (!state.isChatMembersActive && state.activeChatGroup) {
                state.activeChatGroup.type = 'members';
                handlers.handleNavigationChange('chat', state.activeChatGroup);
            }
        });
    }

    if (toggleSectionSettingsButton) {
        toggleSectionSettingsButton.addEventListener('click', () => {
            if (!state.isSectionSettingsActive || !state.isSectionProfileActive) {
                handlers.handleNavigationChange('settings', 'profile');
            }
            handlers.closeMenuOptions();
        });
    }

    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            if (logoutButton.classList.contains('loading')) return;
            logoutButton.classList.add('loading');
            const loaderIconContainer = document.createElement('div');
            loaderIconContainer.className = 'menu-link-icon';
            const loader = document.createElement('div');
            loader.className = 'loader';
            loaderIconContainer.appendChild(loader);
            logoutButton.appendChild(loaderIconContainer);
            const backendLogoutUrl = window.PROJECT_CONFIG.baseUrl.replace('ProjectLeviathan - Frontend', 'ProjectLeviathan - Backend/logout.php');
            const csrfToken = window.PROJECT_CONFIG.csrfToken;
            const form = document.createElement('form');
            form.method = 'POST';
            form.action = backendLogoutUrl;
            const csrfInput = document.createElement('input');
            csrfInput.type = 'hidden';
            csrfInput.name = 'csrf_token';
            csrfInput.value = csrfToken;
            form.appendChild(csrfInput);
            document.body.appendChild(form);
            form.submit();
        });
    }

    if (toggleSectionHomeFromSettingsButton) {
        toggleSectionHomeFromSettingsButton.addEventListener('click', () => handlers.handleNavigationChange('home'));
    }
    if (toggleSectionProfileButton) {
        toggleSectionProfileButton.addEventListener('click', () => {
            if (!state.isSectionProfileActive) handlers.handleNavigationChange('settings', 'profile');
        });
    }
    if (toggleSectionLoginButton) {
        toggleSectionLoginButton.addEventListener('click', () => {
            if (!state.isSectionLoginActive) handlers.handleNavigationChange('settings', 'login');
        });
    }
    if (toggleSectionAccessibilityButton) {
        toggleSectionAccessibilityButton.addEventListener('click', () => {
            if (!state.isSectionAccessibilityActive) handlers.handleNavigationChange('settings', 'accessibility');
        });
    }

    if (state.closeOnClickOutside) {
        document.addEventListener('click', (e) => {
            if (state.isAnimating) return;
            const moduleOptionsIsOpen = moduleOptions.classList.contains('active');
            if (moduleOptionsIsOpen) {
                if (window.innerWidth <= 468 && e.target === moduleOptions) {
                    handlers.closeMenuOptions();
                } else if (window.innerWidth > 468 && !moduleOptions.contains(e.target) && !toggleOptionsButton.contains(e.target)) {
                    handlers.closeMenuOptions();
                }
            }
            const activeSelector = document.querySelector('[data-module="moduleSelector"].active');
            if (activeSelector) {
                const selectorButton = document.querySelector(`[aria-controls="${activeSelector.id}"]`);
                if (selectorButton && !selectorButton.contains(e.target) && !activeSelector.contains(e.target)) {
                    handlers.closeAllSelectors();
                }
            }
            if (moduleSurface.classList.contains('active') && !moduleSurface.contains(e.target) && !toggleSurfaceButton.contains(e.target)) {
                handlers.closeMenuSurface();
            }
            if (accountActionModal.classList.contains('active') && e.target === accountActionModal) {
                handlers.closeAccountActionModal();
            }

            const activeMessageDropdown = document.getElementById('message-options-dropdown');
            if (activeMessageDropdown && !activeMessageDropdown.contains(e.target)) {
                handlers.closeMessageOptions();
            }

            const activeAttachDropdown = document.getElementById('attach-dropdown');
            if (activeAttachDropdown && !activeAttachDropdown.contains(e.target)) {
                handlers.closeAttachDropdown();
            }
        });
    }

    if (state.closeOnEscape) {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                handlers.closeAllModules();
            }
        });
    }

    window.addEventListener('resize', handlers.handleResize);
    themeMediaQuery.addEventListener('change', handlers.handleSystemThemeChange);
}

export { setupEventListeners };