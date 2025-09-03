// /ProjectLeviathan - Frontend/assets/js/main-controller.js

import { initDragController } from './drag-controller.js';
import { initUrlManager, navigateToUrl, getCurrentUrlState, setupPopStateHandler, setInitialHistoryState, updatePageTitle } from './url-manager.js';
import { setupEventListeners } from './event-listeners.js';

function initMainController() {
    const closeOnClickOutside = true;
    const closeOnEscape = true;
    const allowMultipleActiveModules = false;
    let isAnimating = false;

    let websocket = null;
    let currentChatGroupUUID = null;
    let allChatMembers = [];
    let messageOptionsPopper = null;
    let attachDropdownPopper = null;
    let currentReplyMessageId = null;
    let currentImageFile = null;

    let currentMessagesOffset = 0;
    let isLoadingMessages = false;
    let hasMoreMessages = true;

    let chatScrollHandler = null;

    const popperInstances = {};

    initUrlManager();
    const initialState = getCurrentUrlState();

    let isSectionHomeActive = initialState ? initialState.section === 'home' : true;
    let isSectionExploreActive = initialState ? initialState.section === 'explore' : false;
    let isSectionChatActive = initialState ? initialState.section === 'chat' : false;
    let activeChatGroup = null;
    let isSectionSettingsActive = initialState ? initialState.section === 'settings' : false;

    let isSectionMunicipalitiesActive = initialState ? initialState.subsection === 'municipalities' : false;
    let isSectionUniversitiesActive = initialState ? initialState.subsection === 'universities' : false;
    let isSectionProfileActive = initialState ? initialState.subsection === 'profile' : false;
    let isSectionLoginActive = initialState ? initialState.subsection === 'login' : false;
    let isSectionAccessibilityActive = initialState ? initialState.subsection === 'accessibility' : false;
    let isChatMessagesActive = initialState ? initialState.subsection === 'messages' : false;
    let isChatMembersActive = initialState ? initialState.subsection === 'members' : false;

    const toggleOptionsButton = document.querySelector('[data-action="toggleModuleOptions"]');
    const moduleOptions = document.querySelector('[data-module="moduleOptions"]');
    const toggleSurfaceButton = document.querySelector('[data-action="toggleModuleSurface"]');
    const moduleSurface = document.querySelector('[data-module="moduleSurface"]');
    const surfaceMain = document.querySelector('[data-surface-type="main"]');
    const surfaceSettings = document.querySelector('[data-surface-type="settings"]');
    const surfaceChat = document.querySelector('[data-surface-type="chat"]');
    const logoutButton = document.querySelector('[data-action="logout"]');

    const sectionHome = document.querySelector('[data-section="sectionHome"]');
    const sectionExplore = document.querySelector('[data-section="sectionExplore"]');
    const sectionChat = document.querySelector('[data-section="sectionChat"]');
    const sectionChatMembers = document.querySelector('[data-section="sectionChatMembers"]');
    const sectionSettings = document.querySelector('[data-section="sectionSettings"]');
    const sectionProfile = document.querySelector('[data-section="sectionProfile"]');
    const sectionLogin = document.querySelector('[data-section="sectionLogin"]');
    const sectionAccessibility = document.querySelector('[data-section="sectionAccessibility"]');

    const toggleSectionHomeButtons = document.querySelectorAll('[data-action="toggleSectionHome"]');
    const toggleSectionExploreButtons = document.querySelectorAll('[data-action="toggleSectionExplore"]');
    const toggleSectionSettingsButton = document.querySelector('[data-action="toggleSectionSettings"]');
    const toggleSectionHomeFromSettingsButton = document.querySelector('[data-action="toggleSectionHomeFromSettings"]');
    const toggleSectionProfileButton = document.querySelector('[data-action="toggleSectionProfile"]');
    const toggleSectionLoginButton = document.querySelector('[data-action="toggleSectionLogin"]');
    const toggleSectionAccessibilityButton = document.querySelector('[data-action="toggleSectionAccessibility"]');
    const toggleChatMessagesButton = document.querySelector('[data-action="toggleChatMessages"]');
    const toggleChatMembersButton = document.querySelector('[data-action="toggleChatMembers"]');

    const accountActionModal = document.querySelector('[data-module="accountActionModal"]');
    const updatePasswordDialog = accountActionModal?.querySelector('[data-dialog="updatePassword"]');
    const openUpdatePasswordModalButton = document.querySelector('[data-action="openUpdatePasswordModal"]');
    const closeAccountActionModalButtons = document.querySelectorAll('[data-action="closeAccountActionModal"]');
    const paneConfirmPassword = updatePasswordDialog?.querySelector('[data-pane="confirmPassword"]');
    const paneSetNewPassword = updatePasswordDialog?.querySelector('[data-pane="setNewPassword"]');
    const currentPasswordInput = document.getElementById('current-password');
    const newPasswordInput = document.getElementById('new-password');
    const confirmPasswordInput = document.getElementById('confirm-password');
    const confirmCurrentPasswordButton = document.querySelector('[data-action="confirmCurrentPassword"]');
    const saveNewPasswordButton = document.querySelector('[data-action="saveNewPassword"]');
    const confirmErrorContainer = paneConfirmPassword?.querySelector('.dialog-error-message');
    const newErrorContainer = paneSetNewPassword?.querySelector('.dialog-error-message');
    const deleteAccountDialog = accountActionModal?.querySelector('[data-dialog="deleteAccount"]');
    const openDeleteAccountModalButton = document.querySelector('[data-action="openDeleteAccountModal"]');
    const confirmDeleteAccountButton = document.querySelector('[data-action="confirmDeleteAccount"]');
    const deletePasswordInput = document.getElementById('delete-confirm-password');
    const deleteErrorContainer = deleteAccountDialog?.querySelector('.dialog-error-message');

    const exploreTabs = sectionExplore.querySelector('.discovery-tabs');
    const searchInput = document.getElementById('community-search-input');
    const municipalitiesGrid = sectionExplore.querySelector('.discovery-content-section[data-section-id="municipalities"] .discovery-grid');
    const universitiesGrid = sectionExplore.querySelector('.discovery-content-section[data-section-id="universities"] .discovery-grid');
    const loadMoreMunicipalitiesButton = document.querySelector('.load-more-button[data-type="municipalities"]');
    const loadMoreUniversitiesButton = document.querySelector('.load-more-button[data-type="universities"]');
    const homeGrid = document.getElementById('home-grid');
    const chatMessagesWrapper = document.getElementById('chat-messages-wrapper');
    const chatForm = document.getElementById('chat-form');
    const chatInput = chatForm?.querySelector('.chat-input-field');
    const imageInput = document.getElementById('image-input');
    const mentionContainer = document.getElementById('mention-container');
    const mentionList = document.getElementById('mention-list');
    const usernameInput = document.querySelector('[data-section="name"] .edit-input');
    const discoveryContent = sectionExplore.querySelector('.discovery-content');
    const submitAccessCodeButton = document.querySelector('[data-action="submitAccessCode"]');
    const groupAccessCodeInput = document.getElementById('group-access-code');
    const generalContentTop = document.querySelector('.general-content-top');
    const scrollableSections = document.querySelectorAll('.section-content.overflow-y');
    const themeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const ITEMS_PER_PAGE = 12;
    let allMunicipalities = [];
    let allUniversities = [];
    let displayedMunicipalitiesCount = 0;
    let displayedUniversitiesCount = 0;
    let currentUniversityFilter = 'all';

    if (!toggleOptionsButton || !moduleOptions || !toggleSurfaceButton || !moduleSurface || !sectionHome || !sectionExplore || !sectionSettings) return;

    const menuContentOptions = moduleOptions.querySelector('.menu-content');

    setInitialHistoryState();
    setupPopStateHandler((section, subsection, updateHistory) => {
        handleNavigationChange(section, subsection, updateHistory);
    });

    const updateLogState = () => {
        const toState = (active) => active ? '✅ Activo' : '❌ Inactivo';
        const tableData = {
            '── Sections ──': { section: 'Home', status: toState(isSectionHomeActive) },
            ' ': { section: 'Explore', status: toState(isSectionExploreActive) },
            ' ': { section: 'Chat', status: toState(isSectionChatActive) },
            ' ': { section: 'Settings', status: toState(isSectionSettingsActive) },
            '── Sub-sections (Explore) ──': { section: 'Municipalities', status: toState(isSectionMunicipalitiesActive) },
            ' ': { section: 'Universities', status: toState(isSectionUniversitiesActive) },
            '── Sub-sections (Chat) ──': { section: 'Messages', status: toState(isChatMessagesActive) },
            ' ': { section: 'Members', status: toState(isChatMembersActive) },
            '── Sub-sections (Settings) ──': { section: 'Profile', status: toState(isSectionProfileActive) },
            ' ': { section: 'Login', status: toState(isSectionLoginActive) },
            ' ': { section: 'Accessibility', status: toState(isSectionAccessibilityActive) },
        };
        console.group("ProjectLeviathan - State Overview");
        console.table(tableData);
        console.groupEnd();
    };

    const resetPasswordModal = () => {
        if (currentPasswordInput) currentPasswordInput.value = '';
        if (newPasswordInput) newPasswordInput.value = '';
        if (confirmPasswordInput) confirmPasswordInput.value = '';
        if (confirmErrorContainer) confirmErrorContainer.style.display = 'none';
        if (newErrorContainer) newErrorContainer.style.display = 'none';
        paneConfirmPassword?.classList.remove('disabled');
        paneConfirmPassword?.classList.add('active');
        paneSetNewPassword?.classList.add('disabled');
        paneSetNewPassword?.classList.remove('active');
    };

    const resetDeleteAccountModal = () => {
        if (deletePasswordInput) deletePasswordInput.value = '';
        if (deleteErrorContainer) deleteErrorContainer.style.display = 'none';
    };

    const openAccountActionModal = (dialogType) => {
        if (!accountActionModal) return;
        let targetDialog;

        const reportMessageDialog = accountActionModal?.querySelector('[data-dialog="reportMessage"]');
        const confirmDeleteMessageDialog = accountActionModal?.querySelector('[data-dialog="confirmDeleteMessage"]');
        const accessCodeDialog = accountActionModal?.querySelector('[data-dialog="accessCode"]');

        if (dialogType === 'updatePassword') {
            resetPasswordModal();
            targetDialog = updatePasswordDialog;
        } else if (dialogType === 'deleteAccount') {
            resetDeleteAccountModal();
            targetDialog = deleteAccountDialog;
        } else if (dialogType === 'reportMessage') {
            targetDialog = reportMessageDialog;
        } else if (dialogType === 'confirmDeleteMessage') {
            targetDialog = confirmDeleteMessageDialog;
        } else if (dialogType === 'accessCode') {
            targetDialog = accessCodeDialog;
        } else {
            return;
        }

        accountActionModal.classList.remove('disabled');
        accountActionModal.classList.add('active');
        targetDialog?.classList.remove('disabled');
        targetDialog?.classList.add('active');
    };

    const closeAccountActionModal = () => {
        if (!accountActionModal) return false;

        accountActionModal.classList.add('disabled');
        accountActionModal.classList.remove('active');

        accountActionModal.querySelectorAll('.dialog-pane').forEach(pane => {
            pane.classList.add('disabled');
            pane.classList.remove('active');
        });

        return true;
    };

    const showNewPasswordPane = async () => {
        const formData = new FormData();
        formData.append('action', 'update_password');
        formData.append('current_password', currentPasswordInput.value);
        formData.append('csrf_token', window.PROJECT_CONFIG.csrfToken);

        const result = await sendPasswordRequest(formData, confirmErrorContainer);

        if (result.success) {
            confirmErrorContainer.style.display = 'none';
            paneConfirmPassword.classList.remove('active');
            paneConfirmPassword.classList.add('disabled');
            paneSetNewPassword.classList.remove('disabled');
            paneSetNewPassword.classList.add('active');
        } else {
            confirmErrorContainer.textContent = result.message;
            confirmErrorContainer.style.display = 'block';
        }
    };

    const saveNewPassword = async () => {
        const formData = new FormData();
        formData.append('action', 'update_password');
        formData.append('current_password', currentPasswordInput.value);
        formData.append('new_password', newPasswordInput.value);
        formData.append('confirm_password', confirmPasswordInput.value);
        formData.append('csrf_token', window.PROJECT_CONFIG.csrfToken);

        const result = await sendPasswordRequest(formData, newErrorContainer);

        if (result.success) {
            alert(result.message);
            closeAccountActionModal();
        } else {
            newErrorContainer.textContent = result.message;
            newErrorContainer.style.display = 'block';
        }
    };

    const sendPasswordRequest = async (formData, errorContainer) => {
        errorContainer.style.display = 'none';
        try {
            const response = await fetch(window.PROJECT_CONFIG.apiUrl, {
                method: 'POST',
                body: formData
            });
            return await response.json();
        } catch (error) {
            errorContainer.textContent = 'Error de conexión. Inténtalo de nuevo.';
            errorContainer.style.display = 'block';
            return { success: false, message: 'Error de conexión.' };
        }
    };

    const handleDeleteAccount = async () => {
        if (!deletePasswordInput || !deleteErrorContainer) return;

        const formData = new FormData();
        formData.append('action', 'delete_account');
        formData.append('password', deletePasswordInput.value);
        formData.append('csrf_token', window.PROJECT_CONFIG.csrfToken);

        try {
            const response = await fetch(window.PROJECT_CONFIG.apiUrl, {
                method: 'POST',
                body: formData
            });
            const result = await response.json();

            if (result.success) {
                alert('Tu cuenta ha sido eliminada.');
                window.location.href = result.redirect_url;
            } else {
                deleteErrorContainer.textContent = result.message || 'Ocurrió un error.';
                deleteErrorContainer.style.display = 'block';
            }
        } catch (error) {
            deleteErrorContainer.textContent = 'Error de conexión. Inténtalo de nuevo.';
            deleteErrorContainer.style.display = 'block';
        }
    };

    const setMenuOptionsClosed = () => {
        moduleOptions.classList.add('disabled');
        moduleOptions.classList.remove('active', 'fade-out');
        menuContentOptions.classList.add('disabled');
        menuContentOptions.classList.remove('active');
    };

    const setMenuOptionsOpen = () => {
        moduleOptions.classList.remove('disabled');
        moduleOptions.classList.add('active');
        menuContentOptions.classList.remove('disabled');
    };

    const closeMenuOptions = () => {
        if (isAnimating || !moduleOptions.classList.contains('active')) return false;

        if (window.innerWidth <= 468 && menuContentOptions) {
            isAnimating = true;
            menuContentOptions.removeAttribute('style');
            moduleOptions.classList.remove('fade-in');
            moduleOptions.classList.add('fade-out');
            menuContentOptions.classList.remove('active');

            moduleOptions.addEventListener('animationend', (e) => {
                if (e.animationName === 'fadeOut') {
                    setMenuOptionsClosed();
                    isAnimating = false;
                }
            }, { once: true });
        } else {
            setMenuOptionsClosed();
        }
        return true;
    };

    const openMenuOptions = () => {
        if (isAnimating || moduleOptions.classList.contains('active')) return false;

        if (!allowMultipleActiveModules) {
            closeAllModules();
        }

        setMenuOptionsOpen();

        if (window.innerWidth <= 468 && menuContentOptions) {
            isAnimating = true;
            moduleOptions.classList.remove('fade-out');
            moduleOptions.classList.add('fade-in');

            requestAnimationFrame(() => {
                menuContentOptions.classList.add('active');
            });

            moduleOptions.addEventListener('animationend', (e) => {
                if (e.animationName === 'fadeIn') {
                    moduleOptions.classList.remove('fade-in');
                    isAnimating = false;
                }
            }, { once: true });
        } else {
            menuContentOptions.classList.add('active');
        }
        return true;
    };

    const setMenuSurfaceClosed = () => {
        moduleSurface.classList.add('disabled');
        moduleSurface.classList.remove('active');
    };

    const setMenuSurfaceOpen = () => {
        if (!allowMultipleActiveModules) {
            closeAllModules();
        }
        moduleSurface.classList.remove('disabled');
        moduleSurface.classList.add('active');

        const surfaces = {
            main: surfaceMain,
            settings: surfaceSettings,
            chat: surfaceChat
        };

        let activeSurfaceType = 'main';
        if (isSectionSettingsActive) activeSurfaceType = 'settings';
        else if (isSectionChatActive) activeSurfaceType = 'chat';

        for (const type in surfaces) {
            if (surfaces[type]) {
                surfaces[type].classList.toggle('active', type === activeSurfaceType);
                surfaces[type].classList.toggle('disabled', type !== activeSurfaceType);
            }
        }
    };

    const closeMenuSurface = () => {
        if (!moduleSurface.classList.contains('active')) return false;
        setMenuSurfaceClosed();
        return true;
    };

    const openMenuSurface = () => {
        if (moduleSurface.classList.contains('active')) return false;
        setMenuSurfaceOpen();
        return true;
    };

    const closeMessageOptions = () => {
        if (messageOptionsPopper) {
            const dropdown = document.getElementById('message-options-dropdown');
            if (dropdown) {
                dropdown.remove();
            }
            messageOptionsPopper.destroy();
            messageOptionsPopper = null;
            document.querySelector('.message-bubble.active')?.classList.remove('active');
            return true;
        }
        return false;
    };

    const openMessageOptions = (messageElement) => {
        if (messageOptionsPopper) {
            closeMessageOptions();
        }

        if (messageElement.classList.contains('deleted-message')) {
            return;
        }

        messageElement.classList.add('active');

        const template = document.getElementById('message-options-template');
        const dropdown = template.cloneNode(true);
        dropdown.id = 'message-options-dropdown';
        dropdown.style.display = 'block';

        const authorId = parseInt(messageElement.dataset.authorId, 10);
        const isCurrentUser = authorId === window.PROJECT_CONFIG.userId;

        const reportButton = dropdown.querySelector('[data-action="report-message"]');
        if (reportButton) {
            reportButton.style.display = isCurrentUser ? 'none' : 'flex';
        }

        const deleteButton = dropdown.querySelector('[data-action="delete-message"]');
        if (deleteButton) {
            const messageTimestamp = messageElement.dataset.timestamp;
            const sentDate = new Date(messageTimestamp);
            const now = new Date();
            const canDelete = isCurrentUser && (now - sentDate) < 10 * 60 * 1000; // 10 minutos
            deleteButton.style.display = canDelete ? 'flex' : 'none';
        }

        document.body.appendChild(dropdown);

        messageOptionsPopper = Popper.createPopper(messageElement, dropdown, {
            placement: 'bottom-start',
            modifiers: [{ name: 'offset', options: { offset: [0, 8] } }],
        });
    };

    const closeAttachDropdown = () => {
        if (attachDropdownPopper) {
            const dropdown = document.getElementById('attach-dropdown');
            if (dropdown) {
                dropdown.remove();
            }
            attachDropdownPopper.destroy();
            attachDropdownPopper = null;
            return true;
        }
        return false;
    };

    const openAttachDropdown = (attachButton) => {
        if (attachDropdownPopper) {
            closeAttachDropdown();
            return;
        }

        const template = document.getElementById('attach-dropdown-template');
        const dropdown = template.cloneNode(true);
        dropdown.id = 'attach-dropdown';
        dropdown.style.display = 'block';
        document.body.appendChild(dropdown);

        attachDropdownPopper = Popper.createPopper(attachButton, dropdown, {
            placement: 'top-start',
            modifiers: [{ name: 'offset', options: { offset: [0, 8] } }],
        });
    };

    const closeAllSelectors = () => {
        let closed = false;
        document.querySelectorAll('[data-module="moduleSelector"].active').forEach(selector => {
            const button = document.querySelector(`[aria-controls="${selector.id}"]`);
            if (button) {
                button.classList.remove('active');
            }
            selector.classList.add('disabled');
            selector.classList.remove('active');

            const popperId = selector.id;
            if (popperInstances[popperId]) {
                popperInstances[popperId].destroy();
                delete popperInstances[popperId];
            }
            closed = true;
        });
        return closed;
    };

    const closeAllModules = () => {
        closeAllSelectors();
        closeMenuOptions();
        closeMenuSurface();
        closeAccountActionModal();
        closeMessageOptions();
        closeAttachDropdown();
    };

    const updateMainMenuButtons = (activeAction) => {
        const mainMenuLinks = surfaceMain.querySelectorAll('.menu-link');
        mainMenuLinks.forEach(link => {
            link.classList.toggle('active', link.dataset.action === activeAction);
        });
    };

    const updateSettingsMenuButtons = (activeAction) => {
        const settingsMenuLinks = surfaceSettings.querySelectorAll('.menu-link');
        settingsMenuLinks.forEach(link => {
            link.classList.toggle('active', link.dataset.action === activeAction);
        });
    };

    const updateChatMenuButtons = (activeAction) => {
        const chatMenuLinks = surfaceChat.querySelectorAll('.menu-link');
        chatMenuLinks.forEach(link => {
            link.classList.toggle('active', link.dataset.action === activeAction);
        });
    };

    const setSectionActive = (sectionToShow, sectionsToHide, activeStateSetter, updateUrl = true) => {
        sectionToShow.classList.remove('disabled');
        sectionToShow.classList.add('active');
        sectionsToHide.forEach(section => {
            section.classList.add('disabled');
            section.classList.remove('active');
        });

        isSectionHomeActive = activeStateSetter === 'home';
        isSectionExploreActive = activeStateSetter === 'explore';
        isSectionChatActive = activeStateSetter === 'chat';
        isSectionSettingsActive = activeStateSetter === 'settings';

        if (activeStateSetter !== 'settings') {
            isSectionProfileActive = false; isSectionLoginActive = false; isSectionAccessibilityActive = false;
        }
        if (activeStateSetter !== 'explore') {
            isSectionMunicipalitiesActive = false; isSectionUniversitiesActive = false;
        }
        if (activeStateSetter !== 'chat') {
            isChatMessagesActive = false; isChatMembersActive = false;
        }

        const surfaces = {
            main: surfaceMain,
            settings: surfaceSettings,
            chat: surfaceChat
        };

        let activeSurfaceType = 'main';
        if (isSectionSettingsActive) activeSurfaceType = 'settings';
        else if (isSectionChatActive) activeSurfaceType = 'chat';

        for (const type in surfaces) {
            if (surfaces[type]) {
                surfaces[type].classList.toggle('active', type === activeSurfaceType);
                surfaces[type].classList.toggle('disabled', type !== activeSurfaceType);
            }
        }

        if (updateUrl) {
            let subsection = null;
            if (isSectionExploreActive) {
                subsection = isSectionMunicipalitiesActive ? 'municipalities' : 'universities';
            } else if (isSectionSettingsActive) {
                subsection = isSectionProfileActive ? 'profile' : isSectionLoginActive ? 'login' : 'accessibility';
            }
            else if (isSectionChatActive) {
                subsection = activeChatGroup;
            }
            navigateToUrl(activeStateSetter, subsection);
        }
    };

    const setSubSectionActive = (sectionToShow, sectionsToHide, activeStateSetter, updateUrl = true) => {
        sectionToShow.classList.remove('disabled');
        sectionToShow.classList.add('active');
        sectionsToHide.forEach(section => {
            section.classList.add('disabled');
            section.classList.remove('active');
        });

        isSectionMunicipalitiesActive = activeStateSetter === 'municipalities';
        isSectionUniversitiesActive = activeStateSetter === 'universities';
        isChatMessagesActive = activeStateSetter === 'messages';
        isChatMembersActive = activeStateSetter === 'members';
        isSectionProfileActive = activeStateSetter === 'profile';
        isSectionLoginActive = activeStateSetter === 'login';
        isSectionAccessibilityActive = activeStateSetter === 'accessibility';

        if (updateUrl) {
            const mainSection = isSectionExploreActive ? 'explore' : isSectionChatActive ? 'chat' : 'settings';
            let subsectionParam = activeStateSetter;
            if (mainSection === 'chat') {
                if (!activeChatGroup) {
                    console.error("setSubSectionActive fue llamado para el chat, pero activeChatGroup es nulo.");
                    return;
                }
                subsectionParam = {
                    uuid: activeChatGroup.uuid,
                    type: activeStateSetter,
                    title: activeChatGroup.title
                };
            }
            navigateToUrl(mainSection, subsectionParam);
        }
    };

    const resetUIComponents = () => {
        closeAllModules();

        document.querySelectorAll('.card-item .edit-state').forEach(editState => {
            if (!editState.classList.contains('hidden')) {
                editState.classList.add('hidden');
                const parent = editState.closest('.card-item');
                if (parent) {
                    const viewState = parent.querySelector('.view-state');
                    if (viewState && viewState.classList.contains('hidden')) {
                        viewState.classList.remove('hidden');
                    }
                }
            }
        });
    };

    const loadAccountDates = async () => {
        const creationDateElem = document.getElementById('account-creation-date');
        const lastUpdateElem = document.getElementById('last-password-update');

        if (!creationDateElem || !lastUpdateElem) return;

        try {
            const response = await fetch(`${window.PROJECT_CONFIG.apiUrl}?action=get_account_dates`);
            const data = await response.json();

            if (data.success) {
                creationDateElem.textContent = data.creation_date;
                lastUpdateElem.textContent = data.last_password_update;
            } else {
                creationDateElem.textContent = 'No disponible';
                lastUpdateElem.textContent = 'No disponible';
            }
        } catch (error) {
            creationDateElem.textContent = 'Error al cargar';
            lastUpdateElem.textContent = 'Error al cargar';
        }
    };

    const formatMessageTime = (isoTimestamp) => {
        if (!isoTimestamp) return '';
        try {
            const date = new Date(isoTimestamp);
            const hours = date.getHours().toString().padStart(2, '0');
            const minutes = date.getMinutes().toString().padStart(2, '0');
            return `${hours}:${minutes}`;
        } catch (e) {
            console.error("Invalid timestamp format:", isoTimestamp);
            return '';
        }
    };

    const formatDateSeparator = (isoTimestamp) => {
        const date = new Date(isoTimestamp);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (date.toDateString() === today.toDateString()) {
            return 'Hoy';
        } else if (date.toDateString() === yesterday.toDateString()) {
            return 'Ayer';
        } else {
            return date.toLocaleDateString('es-ES', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        }
    };

    const formatMessageText = (text) => {
        const mentionRegex = /(^|\s)@([a-zA-Z0-9_]{4,25})\b/g;
        return text.replace(mentionRegex, (match, precedingWhitespace, username) => {
            const userExists = allChatMembers.some(member => member.username === username);
            if (userExists) {
                return `${precedingWhitespace}<span class="mention">@${username}</span>`;
            }
            return match;
        });
    };

    const connectWebSocket = async (groupUuid) => {
        if (websocket && websocket.readyState === WebSocket.OPEN) {
            websocket.close();
        }

        try {
            const formData = new FormData();
            formData.append('action', 'get_websocket_token');
            formData.append('csrf_token', window.PROJECT_CONFIG.csrfToken);

            const response = await fetch(window.PROJECT_CONFIG.wsApiUrl, {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (!data.success) {
                console.error('No se pudo obtener el token para el WebSocket:', data.message);
                alert('Error de autenticación al conectar con el chat.');
                return;
            }

            const token = data.token;
            currentChatGroupUUID = groupUuid;

            websocket = new WebSocket('ws://localhost:8765');

            websocket.onopen = () => {
                console.log('WebSocket conectado.');
                const authMessage = {
                    type: 'auth',
                    token: token,
                    group_uuid: groupUuid
                };
                websocket.send(JSON.stringify(authMessage));
            };

            websocket.onmessage = (event) => {
                const data = JSON.parse(event.data);
                if (data.type === 'new_message') {
                    appendMessage(data);
                }
                if (data.type === 'user_status_update') {
                    updateMembersList(data.online_users);
                }
                if (data.type === 'message_deleted') {
                    const messageBubble = document.querySelector(`[data-message-id="${data.message_id}"]`);
                    if (messageBubble) {
                        messageBubble.classList.add('deleted-message');
                        messageBubble.innerHTML = `
                            <div class="message-content">
                                <p><em>Mensaje eliminado</em></p>
                            </div>
                        `;
                    }
                }
            };

            websocket.onclose = () => {
                console.log('WebSocket desconectado.');
                websocket = null;
            };

            websocket.onerror = (error) => {
                console.error('Error en WebSocket:', error);
                websocket = null;
            };

        } catch (error) {
            console.error('Error al intentar conectar al WebSocket:', error);
            alert('Error de conexión con el chat.');
        }
    };

    const appendMessage = (data) => {
        const messagesContainer = document.getElementById('chat-messages-container');
        if (!messagesContainer) return;
        
        const chatScrollContainer = document.getElementById('chat-messages-wrapper');
        if (!chatScrollContainer) return;

        const welcomeMessage = document.getElementById('chat-welcome-message');
        if (welcomeMessage) {
            welcomeMessage.style.display = 'none';
        }

        const lastBubble = messagesContainer.querySelector('.message-bubble:last-child');
        const lastBubbleDate = lastBubble ? new Date(lastBubble.dataset.timestamp).toDateString() : null;
        const messageDate = new Date(data.timestamp).toDateString();

        if (!lastBubble || messageDate !== lastBubbleDate) {
            const dateSeparator = document.createElement('div');
            dateSeparator.className = 'chat-date-separator';
            dateSeparator.innerHTML = `<span>${formatDateSeparator(data.timestamp)}</span>`;
            messagesContainer.appendChild(dateSeparator);
        }

        const isSentByCurrentUser = data.user_id === window.PROJECT_CONFIG.userId;
        const messageClass = isSentByCurrentUser ? 'sent' : 'received';
        const username = isSentByCurrentUser ? 'Tú' : data.username;
        const time = formatMessageTime(data.timestamp);
        const formattedMessage = formatMessageText(data.message);

        const messageBubble = document.createElement('div');
        messageBubble.className = `message-bubble ${messageClass}`;
        messageBubble.dataset.messageId = data.message_id;
        messageBubble.dataset.authorId = data.user_id;
        messageBubble.dataset.timestamp = data.timestamp;

        let replyHTML = '';
        if (data.reply_context && !data.is_deleted) {
            const replyAuthor = data.reply_context.username === window.PROJECT_CONFIG.username ? 'Tú' : data.reply_context.username;
            const replyText = data.reply_context.message_text;
            const replyImage = data.reply_context.image_url;

            let replyContentHTML = '';
            if (replyImage) {
                replyContentHTML += `<img src="${replyImage}" class="reply-thumbnail" alt="Imagen respondida">`;
            }
            if (replyText) {
                replyContentHTML += `<p>${replyText}</p>`;
            }
            replyHTML = `
            <div class="reply-context">
                <strong>${replyAuthor}</strong>
                ${replyContentHTML}
            </div>
        `;
        }

        let imageHTML = '';
        if (data.image_url) {
            imageHTML = `<img src="${data.image_url}" alt="Imagen adjunta">`;
        }

        if (data.is_deleted) {
            messageBubble.classList.add('deleted-message');
            messageBubble.innerHTML = `
            <div class="message-content">
                <p><em>${data.message}</em></p>
            </div>`;
        } else {
            messageBubble.innerHTML = `
            ${replyHTML}
            <span class="message-info">${username}</span>
            <div class="message-content">
                <p>${formattedMessage}</p>
                <span class="message-time">${time}</span>
            </div>
            ${imageHTML}`;
        }

        messagesContainer.appendChild(messageBubble);
        chatScrollContainer.scrollTop = chatScrollContainer.scrollHeight;
    };
    const prependMessage = (data) => {
        const messagesContainer = document.getElementById('chat-messages-container');
        if (!messagesContainer) return;

        const isSentByCurrentUser = data.user_id === window.PROJECT_CONFIG.userId;
        const messageClass = isSentByCurrentUser ? 'sent' : 'received';
        const username = isSentByCurrentUser ? 'Tú' : data.username;
        const time = formatMessageTime(data.timestamp);
        const formattedMessage = formatMessageText(data.message);

        const messageBubble = document.createElement('div');
        messageBubble.className = `message-bubble ${messageClass}`;
        messageBubble.dataset.messageId = data.message_id;
        messageBubble.dataset.authorId = data.user_id;
        messageBubble.dataset.timestamp = data.timestamp;

        let replyHTML = '';
        if (data.reply_context && !data.is_deleted) {
            const replyAuthor = data.reply_context.username === window.PROJECT_CONFIG.username ? 'Tú' : data.reply_context.username;
            const replyText = data.reply_context.message_text;
            const replyImage = data.reply_context.image_url;

            let replyContentHTML = '';
            if (replyImage) {
                replyContentHTML += `<img src="${replyImage}" class="reply-thumbnail" alt="Imagen respondida">`;
            }
            if (replyText) {
                replyContentHTML += `<p>${replyText}</p>`;
            }

            replyHTML = `
            <div class="reply-context">
                <strong>${replyAuthor}</strong>
                 ${replyContentHTML}
            </div>
        `;
        }

        let imageHTML = '';
        if (data.image_url) {
            imageHTML = `<img src="${data.image_url}" alt="Imagen adjunta">`;
        }

        if (data.is_deleted) {
            messageBubble.classList.add('deleted-message');
            messageBubble.innerHTML = `
            <div class="message-content">
                <p><em>${data.message}</em></p>
            </div>`;
        } else {
            messageBubble.innerHTML = `
            ${replyHTML}
            <span class="message-info">${username}</span>
            <div class="message-content">
                <p>${formattedMessage}</p>
                <span class="message-time">${time}</span>
            </div>
            ${imageHTML}`;
        }

        messagesContainer.insertBefore(messageBubble, messagesContainer.firstChild);
    };

    const loadChat = async (groupInfo) => {
        const messagesContainer = document.getElementById('chat-messages-container');
        const chatScrollContainer = document.getElementById('chat-messages-wrapper');
        const initialLoader = document.getElementById('chat-initial-loader');

        if (!chatScrollContainer || !messagesContainer || !initialLoader) {
            console.error("Elementos del DOM del chat no encontrados.");
            return;
        }

        // --- INICIO DE LA MODIFICACIÓN ---
        // Mostrar el loader inicial y limpiar el chat
        initialLoader.style.display = 'flex';
        messagesContainer.innerHTML = '';
        // --- FIN DE LA MODIFICACIÓN ---
        
        currentMessagesOffset = 0;
        isLoadingMessages = false;
        hasMoreMessages = true;

        if (chatScrollHandler) {
            chatScrollContainer.removeEventListener('scroll', chatScrollHandler);
        }

        chatScrollHandler = () => {
            if (chatScrollContainer.scrollTop === 0) {
                loadMoreMessages(groupInfo.uuid);
            }
        };

        chatScrollContainer.addEventListener('scroll', chatScrollHandler);

        if (!groupInfo || !groupInfo.uuid) {
            console.error("No se proporcionó información del grupo para cargar el chat.");
            handleNavigationChange('home');
            return;
        }

        document.getElementById('chat-messages-menu-title').textContent = 'Cargando...';
        document.getElementById('members-group-title').textContent = 'Cargando...';

        try {
            const [detailsResponse, membersResponse] = await Promise.all([
                fetch(`${window.PROJECT_CONFIG.apiUrl}?action=get_group_details&group_uuid=${groupInfo.uuid}`),
                fetch(`${window.PROJECT_CONFIG.apiUrl}?action=get_group_members&group_uuid=${groupInfo.uuid}`)
            ]);

            const detailsData = await detailsResponse.json();
            const membersData = await membersResponse.json();

            if (detailsData.success && membersData.success) {
                const realTitle = detailsData.group.group_title;
                activeChatGroup = { uuid: groupInfo.uuid, title: realTitle, type: groupInfo.type || 'messages' };
                updatePageTitle('chat', activeChatGroup);
                document.getElementById('chat-messages-menu-title').textContent = realTitle;
                document.getElementById('members-group-title').textContent = realTitle;

                allChatMembers = membersData.members;
                updateMembersList([], document.getElementById('chat-members-list-page'));

                await loadMoreMessages(groupInfo.uuid);
                connectWebSocket(groupInfo.uuid);

            } else {
                const errorMessage = detailsData.message || membersData.message || 'Ocurrió un error inesperado.';
                alert(errorMessage);
                handleNavigationChange('home');
            }
        } catch (error) {
            console.error("Error al cargar los detalles del chat:", error);
            alert("Error de conexión al intentar cargar el chat.");
            handleNavigationChange('home');
        }
    };

    const showWelcomeMessageIfNeeded = () => {
        const messagesContainer = document.getElementById('chat-messages-container');
        const welcomeMessage = document.getElementById('chat-welcome-message');
        if (messagesContainer && welcomeMessage) {
            const hasMessages = messagesContainer.querySelector('.message-bubble');
            welcomeMessage.style.display = hasMessages ? 'none' : 'flex';
        }
    };

    const loadMoreMessages = async (groupUuid) => {
        if (isLoadingMessages || !hasMoreMessages) return;
        isLoadingMessages = true;
    
        const scrollLoader = document.getElementById('chat-loader-container');
        const initialLoader = document.getElementById('chat-initial-loader');
        const welcomeMessage = document.getElementById('chat-welcome-message');
        const chatScrollContainer = document.getElementById('chat-messages-wrapper');
        const messagesContainer = document.getElementById('chat-messages-container');
    
        if (!chatScrollContainer) return;
    
        // Mostrar el loader apropiado
        if (currentMessagesOffset > 0 && scrollLoader) {
            scrollLoader.style.display = 'flex';
        }
    
        if (welcomeMessage) welcomeMessage.style.display = 'none';
    
        try {
            const response = await fetch(`${window.PROJECT_CONFIG.apiUrl}?action=get_chat_messages&group_uuid=${groupUuid}&offset=${currentMessagesOffset}`);
            const data = await response.json();
    
            if (data.success && data.messages.length === 0 && currentMessagesOffset === 0) {
                hasMoreMessages = false;
                showWelcomeMessageIfNeeded();
                return;
            }
    
            if (data.success && data.messages.length > 0) {
                const oldScrollHeight = chatScrollContainer.scrollHeight;
    
                data.messages.forEach(message => {
                    prependMessage(message);
                });
    
                let lastDate = null;
                const allMessages = messagesContainer.querySelectorAll('.message-bubble');
                messagesContainer.querySelectorAll('.chat-date-separator').forEach(sep => sep.remove());
    
                allMessages.forEach(bubble => {
                    const messageDate = new Date(bubble.dataset.timestamp).toDateString();
                    if (messageDate !== lastDate) {
                        const separator = document.createElement('div');
                        separator.className = 'chat-date-separator';
                        separator.innerHTML = `<span>${formatDateSeparator(bubble.dataset.timestamp)}</span>`;
                        messagesContainer.insertBefore(separator, bubble);
                        lastDate = messageDate;
                    }
                });
    
                if (currentMessagesOffset === 0) {
                    setTimeout(() => {
                        chatScrollContainer.scrollTop = chatScrollContainer.scrollHeight;
                    }, 0);
                } else {
                    chatScrollContainer.scrollTop = chatScrollContainer.scrollHeight - oldScrollHeight;
                }
                currentMessagesOffset += data.messages.length;
            } else {
                hasMoreMessages = false;
            }
    
            if (data.messages.length < 50) {
                hasMoreMessages = false;
            }
        } catch (error) {
            console.error("Error de red al cargar más mensajes:", error);
            hasMoreMessages = false;
        } finally {
            isLoadingMessages = false;
            // Ocultar todos los loaders
            if (initialLoader) initialLoader.style.display = 'none';
            if (scrollLoader) scrollLoader.style.display = 'none';
            showWelcomeMessageIfNeeded();
        }
    };    

    const updateMembersList = (onlineUserIds) => {
        const container = document.getElementById('chat-members-list-page');
        if (!container) return;

        const onlineCountSpan = document.getElementById('members-online-count');
        if (onlineCountSpan) onlineCountSpan.textContent = `${onlineUserIds.length} de ${allChatMembers.length} miembros en línea`;

        container.innerHTML = '';

        const membersByRole = allChatMembers.reduce((acc, member) => {
            const role = member.role || 'user';
            if (!acc[role]) acc[role] = [];
            acc[role].push(member);
            return acc;
        }, {});

        const roleOrder = ['owner', 'admin', 'community-manager', 'moderator', 'elite', 'premium', 'vip', 'user'];

        roleOrder.forEach(role => {
            if (membersByRole[role] && membersByRole[role].length > 0) {
                const roleCard = document.createElement('div');
                roleCard.className = 'card';

                const roleName = role.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

                let cardHTML = `<div class="card-item with-divider member-list-header"><strong>${roleName}s</strong></div>`;

                membersByRole[role].forEach((member, index) => {
                    const isOnline = onlineUserIds.includes(member.id);
                    const statusClass = isOnline ? 'online' : 'offline';

                    const dividerClass = index < membersByRole[role].length - 1 ? 'with-divider' : '';

                    cardHTML += `
                        <div class="card-item member-list-item ${dividerClass}">
                            <div class="card-content">
                                <div class="member-status ${statusClass}" style="margin-right: 16px;"></div>
                                <div class="card-info">
                                    <strong>${member.username}</strong>
                                    <span>${roleName}</span>
                                </div>
                            </div>
                        </div>
                    `;
                });

                roleCard.innerHTML = cardHTML;
                container.appendChild(roleCard);
            }
        });
    };

    const handleNavigationChange = (section, subsection = null, updateUrl = true) => {
        const wasChatActive = isSectionChatActive;
    
        resetUIComponents();
    
        if (wasChatActive && (section !== 'chat' || (subsection && activeChatGroup?.uuid !== subsection.uuid))) {
            if (websocket) {
                websocket.close();
            }
            currentChatGroupUUID = null;
    
            const chatScrollContainer = document.getElementById('chat-messages-wrapper');
            if (chatScrollContainer && chatScrollHandler) {
                chatScrollContainer.removeEventListener('scroll', chatScrollHandler);
                chatScrollHandler = null;
            }
        }
    
        if (section === 'home') {
            setSectionActive(sectionHome, [sectionExplore, sectionChat, sectionChatMembers, sectionSettings], 'home', updateUrl);
            updateMainMenuButtons('toggleSectionHome');
            loadHomeContent();
        } else if (section === 'explore') {
            setSectionActive(sectionExplore, [sectionHome, sectionChat, sectionChatMembers, sectionSettings], 'explore', false);
            updateMainMenuButtons('toggleSectionExplore');
            const sub = subsection || 'municipalities';
            const municipalitiesSection = document.querySelector('[data-section-id="municipalities"]');
            const universitiesSection = document.querySelector('[data-section-id="universities"]');
            if (sub === 'municipalities') {
                setSubSectionActive(municipalitiesSection, [universitiesSection], 'municipalities', updateUrl);
                exploreTabs.querySelector('.tab-item[data-tab="municipalities"]').classList.add('active');
                exploreTabs.querySelector('.tab-item[data-tab="universities"]').classList.remove('active');
            } else if (sub === 'universities') {
                setSubSectionActive(universitiesSection, [municipalitiesSection], 'universities', updateUrl);
                exploreTabs.querySelector('.tab-item[data-tab="universities"]').classList.add('active');
                exploreTabs.querySelector('.tab-item[data-tab="municipalities"]').classList.remove('active');
            }
            if (allMunicipalities.length === 0) loadMunicipalityGroups();
            if (allUniversities.length === 0) loadUniversityGroups(currentUniversityFilter);
            populateMunicipalityFilter();
        } else if (section === 'chat') {
            const isNewChat = !wasChatActive || !activeChatGroup || activeChatGroup.uuid !== subsection.uuid;
            
            activeChatGroup = subsection;
    
            if (isNewChat) {
                setSectionActive(sectionChat, [sectionHome, sectionExplore, sectionSettings], 'chat', false);
                loadChat(subsection);
            }
            
            const sub = subsection.type || 'messages';
            if (sub === 'messages') {
                setSubSectionActive(sectionChat, [sectionChatMembers], 'messages', updateUrl);
                updateChatMenuButtons('toggleChatMessages');
            } else if (sub === 'members') {
                setSubSectionActive(sectionChatMembers, [sectionChat], 'members', updateUrl);
                updateChatMenuButtons('toggleChatMembers');
            }
        } else if (section === 'settings') {
            setSectionActive(sectionSettings, [sectionHome, sectionExplore, sectionChat, sectionChatMembers], 'settings', false);
            const sub = subsection || 'profile';
            if (sub === 'profile') {
                setSubSectionActive(sectionProfile, [sectionLogin, sectionAccessibility], 'profile', updateUrl);
                updateSettingsMenuButtons('toggleSectionProfile');
            } else if (sub === 'login') {
                setSubSectionActive(sectionLogin, [sectionProfile, sectionAccessibility], 'login', updateUrl);
                updateSettingsMenuButtons('toggleSectionLogin');
                loadAccountDates();
            } else if (sub === 'accessibility') {
                setSubSectionActive(sectionAccessibility, [sectionProfile, sectionLogin], 'accessibility', updateUrl);
                updateSettingsMenuButtons('toggleSectionAccessibility');
            }
        }
    
        if (window.innerWidth <= 468) {
            closeMenuSurface();
            closeMenuOptions();
        }
    
        updateLogState();
    };    

    const handleResize = () => {
        if (moduleOptions.classList.contains('active')) {
            if (window.innerWidth <= 468) {
                if (!menuContentOptions.classList.contains('active')) {
                    menuContentOptions.classList.add('active');
                }
            } else {
                menuContentOptions.classList.remove('active');
                menuContentOptions.removeAttribute('style');
            }
        }
    };

    const handleProfileUpdate = async (button) => {
        const field = button.dataset.field;
        const parentItem = button.closest('.card-item');
        const editState = parentItem.querySelector('.edit-state');
        const viewState = parentItem.querySelector('.view-state');
        const input = editState.querySelector('.edit-input');
        const errorSpan = editState.querySelector('.edit-error-message');
        const newValue = input.value;

        errorSpan.style.display = 'none';
        errorSpan.textContent = '';

        if (field === 'email') {
            const emailRegex = /^[a-zA-Z0-9._-]+@(gmail\.com|outlook\.com)$/i;
            if (!emailRegex.test(newValue)) {
                errorSpan.textContent = 'Solo se permiten correos de @gmail.com o @outlook.com.';
                errorSpan.style.display = 'block';
                return;
            }
        }

        if (field === 'username') {
            const usernameRegex = /^[a-zA-Z0-9_]{4,25}$/;
            if (!usernameRegex.test(newValue)) {
                errorSpan.textContent = 'El nombre debe tener entre 4 y 25 caracteres, y solo puede contener letras, números y guiones bajos.';
                errorSpan.style.display = 'block';
                return;
            }
        }

        const formData = new FormData();
        formData.append('action', 'update_profile');
        formData.append('field', field);
        formData.append('value', newValue);
        formData.append('csrf_token', window.PROJECT_CONFIG.csrfToken);

        try {
            const response = await fetch(window.PROJECT_CONFIG.apiUrl, {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (result.success) {
                const displaySpan = viewState.querySelector('.card-info span');
                displaySpan.textContent = result.newValue;

                editState.classList.add('hidden');
                viewState.classList.remove('hidden');
            } else {
                errorSpan.textContent = result.message || 'Ocurrió un error desconocido.';
                errorSpan.style.display = 'block';
            }
        } catch (error) {
            errorSpan.textContent = 'Error de conexión. Inténtalo de nuevo.';
            errorSpan.style.display = 'block';
        }
    };

    const handlePreferenceUpdate = async (field, value) => {
        const formData = new FormData();
        formData.append('action', 'update_preference');
        formData.append('field', field);
        formData.append('value', value);
        formData.append('csrf_token', window.PROJECT_CONFIG.csrfToken);

        try {
            const response = await fetch(window.PROJECT_CONFIG.apiUrl, {
                method: 'POST',
                body: formData
            });
            const result = await response.json();
            if (result.success) {
                if (window.PROJECT_CONFIG.userPreferences) {
                    window.PROJECT_CONFIG.userPreferences[field] = String(value);
                }
            } else {
                console.error('Failed to save preference:', result.message);
            }
        } catch (error) {
            console.error('Connection error while saving preference:', error);
        }
    };

    const initializePreferenceControls = () => {
        const prefs = window.PROJECT_CONFIG.userPreferences || {};

        document.querySelectorAll('[data-preference-field]').forEach(container => {
            const field = container.dataset.preferenceField;
            const value = prefs[field];

            const toggle = container.querySelector('.toggle-switch input[type="checkbox"]');
            if (toggle) {
                toggle.checked = (value == true);
            }

            const selectorButton = container.querySelector('.selector-input');
            if (selectorButton) {
                const menuList = container.querySelector('.menu-list');
                const activeLink = menuList.querySelector(`.menu-link[data-value="${value}"]`) || menuList.querySelector('.menu-link.active');

                if (activeLink) {
                    const textSpan = selectorButton.querySelector('.selected-value-text');
                    const iconSpan = selectorButton.querySelector('.selected-value-icon.left .material-symbols-rounded');

                    textSpan.textContent = activeLink.querySelector('.menu-link-text span').textContent;
                    if (iconSpan && activeLink.querySelector('.menu-link-icon .material-symbols-rounded')) {
                        iconSpan.textContent = activeLink.querySelector('.menu-link-icon .material-symbols-rounded').textContent;
                    }
                }
            }
        });
    };

    const applyTheme = (themeValue) => {
        const docEl = document.documentElement;
        let isDark;

        if (themeValue === 'system') {
            isDark = themeMediaQuery.matches;
        } else {
            isDark = themeValue === 'dark';
        }

        docEl.classList.remove(isDark ? 'light-theme' : 'dark-theme');
        docEl.classList.add(isDark ? 'dark-theme' : 'light-theme');
    };

    const handleSystemThemeChange = (e) => {
        const currentThemePref = window.PROJECT_CONFIG.userPreferences.theme;
        if (currentThemePref === 'system') {
            applyTheme('system');
        }
    };

    const displayGroups = (sourceArray, gridElement, countState, buttonElement) => {
        gridElement.innerHTML = '';
        const groupsToDisplay = sourceArray.slice(0, countState);

        if (groupsToDisplay.length === 0 && sourceArray.length > 0) {
            gridElement.innerHTML = '<p class="empty-grid-message">No se encontraron más comunidades.</p>';
        } else if (sourceArray.length === 0) {
            gridElement.innerHTML = '<p class="empty-grid-message">No hay comunidades para mostrar.</p>';
        } else {
            renderGroupCards(groupsToDisplay, gridElement);
        }

        if (buttonElement && countState >= sourceArray.length) {
            buttonElement.classList.add('hidden');
        } else if (buttonElement) {
            buttonElement.classList.remove('hidden');
        }
    };

    const loadMunicipalityGroups = async () => {
        try {
            const response = await fetch(`${window.PROJECT_CONFIG.apiUrl}?action=get_municipality_groups`);
            const data = await response.json();
            if (data.success) {
                allMunicipalities = data.groups;
                displayedMunicipalitiesCount = ITEMS_PER_PAGE;
                displayGroups(allMunicipalities, municipalitiesGrid, displayedMunicipalitiesCount, loadMoreMunicipalitiesButton);
            } else {
                municipalitiesGrid.innerHTML = `<p>${data.message || 'Error al cargar grupos.'}</p>`;
            }
        } catch (error) {
            municipalitiesGrid.innerHTML = '<p>Error de conexión.</p>';
        }
    };

    const loadUniversityGroups = async (municipalityId) => {
        currentUniversityFilter = municipalityId;
        universitiesGrid.innerHTML = '<div class="loader-container"><div class="loader"></div></div>';
        try {
            const response = await fetch(`${window.PROJECT_CONFIG.apiUrl}?action=get_university_groups&municipality_id=${municipalityId}`);
            const data = await response.json();

            if (data.success) {
                allUniversities = data.groups;
                displayedUniversitiesCount = ITEMS_PER_PAGE;
                displayGroups(allUniversities, universitiesGrid, displayedUniversitiesCount, loadMoreUniversitiesButton);
            } else {
                universitiesGrid.innerHTML = `<p>${data.message || 'Error al cargar universidades.'}</p>`;
            }
        } catch (error) {
            console.error('Error al cargar universidades:', error);
            universitiesGrid.innerHTML = '<p>Error de conexión.</p>';
        }
    };

    const populateMunicipalityFilter = async () => {
        const universityMunicipalitySelectorDropdown = document.getElementById('university-municipality-selector-dropdown');
        if (!universityMunicipalitySelectorDropdown) return;

        try {
            const response = await fetch(`${window.PROJECT_CONFIG.apiUrl}?action=get_municipalities`);
            const data = await response.json();
            if (data.success) {
                const menuList = universityMunicipalitySelectorDropdown.querySelector('.menu-list');
                if (!menuList) return;
                menuList.innerHTML = '';

                let totalUniversities = 0;
                data.municipalities.forEach(municipality => {
                    totalUniversities += parseInt(municipality.university_count, 10);
                });

                const allOption = document.createElement('div');
                allOption.className = 'menu-link active';
                allOption.dataset.value = 'all';
                allOption.innerHTML = `
                    <div class="menu-link-icon"><span class="material-symbols-rounded">public</span></div>
                    <div class="menu-link-text">
                        <span>Todos los municipios</span>
                        <span class="menu-link-badge">${totalUniversities}</span>
                    </div>
                `;
                menuList.appendChild(allOption);

                data.municipalities.forEach(municipality => {
                    const option = document.createElement('div');
                    option.className = 'menu-link';
                    option.dataset.value = municipality.id;
                    option.innerHTML = `
                        <div class="menu-link-icon"><span class="material-symbols-rounded">location_city</span></div>
                        <div class="menu-link-text">
                            <span>${municipality.group_title}</span>
                            <span class="menu-link-badge">${municipality.university_count}</span>
                        </div>
                    `;
                    menuList.appendChild(option);
                });
            }
        } catch (error) {
            console.error('Error populating municipality filter:', error);
        }
    };

    const renderGroupCards = (groups, grid) => {
        grid.innerHTML = '';
        if (!groups) return;
        groups.forEach(group => {
            const isMember = group.is_member;
            const card = document.createElement('div');
            card.className = 'community-card';
            card.dataset.groupUuid = group.uuid;
            card.dataset.groupName = group.group_title.toLowerCase();
    
            const groupType = group.group_type || (grid === universitiesGrid ? 'university' : 'municipality');
            card.dataset.groupType = groupType;
    
            const icon = groupType === 'university' ? 'school' : 'groups';
    
            let buttonsHTML = '';
            if (isMember) {
                buttonsHTML = `
                    <div class="community-card-actions">
                        <button class="community-card-button leave" data-privacy="${group.privacy}">
                            <span class="material-symbols-rounded">door_open</span>
                            <span>Abandonar</span>
                        </button>
                        <button class="community-card-button view">
                            <span class="material-symbols-rounded">visibility</span>
                            <span>Ver</span>
                        </button>
                    </div>
                `;
            } else {
                buttonsHTML = `
                    <div class="community-card-actions">
                        <button class="community-card-button join" data-privacy="${group.privacy}">
                            <span class="material-symbols-rounded">group_add</span>
                            <span>Unirse</span>
                        </button>
                    </div>
                `;
            }
    
            card.innerHTML = `
                <div class="community-card-main">
                    <div class="community-card-icon-wrapper">
                        <span class="material-symbols-rounded">${icon}</span>
                    </div>
                    <div class="community-card-info">
                        <h3 class="community-card-title">${group.group_title}</h3>
                        <p class="community-card-subtitle">${group.group_subtitle || ''}</p>
                        <div class="community-card-stats">
                            <div class="info-pill">
                                <span class="material-symbols-rounded">${group.privacy === 'public' ? 'public' : 'lock'}</span>
                                <span>${group.privacy === 'public' ? 'Público' : 'Privado'}</span>
                            </div>
                            <div class="info-pill">
                                <span class="material-symbols-rounded">group</span>
                                <span data-member-count>${group.members}</span>
                            </div>
                        </div>
                    </div>
                </div>
                ${buttonsHTML}
            `;
            grid.appendChild(card);
        });
    };

    const loadHomeContent = async () => {
        const homeTabs = document.getElementById('home-tabs');
        if (!homeTabs) return;
    
        try {
            const response = await fetch(`${window.PROJECT_CONFIG.apiUrl}?action=get_user_groups`);
            const data = await response.json();
            if (data.success && data.groups.length > 0) {
                renderDashboardView(data.groups);
            } else {
                renderDiscoveryView();
            }
        } catch (error) {
            console.error("Error loading user groups, showing discovery view.", error);
            renderDiscoveryView();
        }
    };

    const refreshHomeView = () => {
        const activeTab = document.querySelector('#home-tabs .tab-item.active');
        if (activeTab) {
            activeTab.click();
        } else {
            loadHomeContent();
        }
    };

    const renderDashboardView = (groups) => {
        const homeTabs = document.getElementById('home-tabs');
        const homeGrid = document.getElementById('home-grid');

        homeTabs.innerHTML = `
            <div class="tab-item active" data-tab="my-communities">
                <span class="material-symbols-rounded">groups</span>
                <span>Mis Comunidades</span>
            </div>
            <div class="tab-item" data-tab="recommendations">
                <span class="material-symbols-rounded">recommend</span>
                <span>Recomendaciones</span>
            </div>
            <div class="tab-item" data-tab="trending">
                <span class="material-symbols-rounded">local_fire_department</span>
                <span>Tendencias</span>
            </div>
        `;
        renderGroupCards(groups, homeGrid, true);
    };

    const renderDiscoveryView = async () => {
        const homeTabs = document.getElementById('home-tabs');
        const homeGrid = document.getElementById('home-grid');

        homeTabs.innerHTML = `
            <div class="tab-item active" data-tab="recommendations">
                <span class="material-symbols-rounded">recommend</span>
                <span>Recomendaciones</span>
            </div>
            <div class="tab-item" data-tab="trending">
                <span class="material-symbols-rounded">local_fire_department</span>
                <span>Tendencias</span>
            </div>
        `;
        homeGrid.innerHTML = '<div class="loader-container"><div class="loader"></div></div>';
        try {
            const response = await fetch(`${window.PROJECT_CONFIG.apiUrl}?action=get_recommended_groups`);
            const data = await response.json();
            if (data.success) {
                renderGroupCards(data.groups, homeGrid);
            } else {
                homeGrid.innerHTML = `<p>${data.message || 'Error al cargar recomendaciones.'}</p>`;
            }
        } catch (error) {
             homeGrid.innerHTML = '<p>Error de conexión.</p>';
        }
    };

    const reportMessage = async (messageId, reportImage) => {
        const formData = new FormData();
        formData.append('action', 'report_message');
        formData.append('message_id', messageId);
        formData.append('report_image', reportImage);
        formData.append('csrf_token', window.PROJECT_CONFIG.csrfToken);

        try {
            const response = await fetch(window.PROJECT_CONFIG.apiUrl, {
                method: 'POST',
                body: formData
            });
            const result = await response.json();

            if (result.success) {
                alert('Mensaje reportado con éxito.');
            } else {
                alert(`Error al reportar: ${result.message}`);
            }
        } catch (error) {
            alert('Error de conexión al reportar el mensaje.');
        } finally {
            closeAccountActionModal();
        }
    };

    const initializePageData = () => {
        const initialState = getCurrentUrlState();
        if (initialState) {
            let initialSubsection = initialState.subsection;
            if (initialState.isChatSection && initialState.id) {
                initialSubsection = { uuid: initialState.id, title: 'Cargando...', type: initialState.subsection };
            }
            handleNavigationChange(initialState.section, initialSubsection, false);

            if (initialState.section === 'settings' && initialState.subsection === 'login') {
                loadAccountDates();
            }
        }
        initializePreferenceControls();
    };

    const domElements = {
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
    };

    // --- INICIO DE LA CORRECCIÓN ---
    // Se ha modificado el objeto 'state' para que las propiedades booleanas
    // sean 'getters'. Esto asegura que siempre se lea el valor más reciente
    // de las variables de estado, en lugar de una copia inicial.
    const state = {
        get isAnimating() { return isAnimating; },
        set isAnimating(value) { isAnimating = value; },
        get currentReplyMessageId() { return currentReplyMessageId; },
        set currentReplyMessageId(value) { currentReplyMessageId = value; },
        get currentImageFile() { return currentImageFile; },
        set currentImageFile(value) { currentImageFile = value; },
        get websocket() { return websocket; },
        get allChatMembers() { return allChatMembers; },
        get isSectionHomeActive() { return isSectionHomeActive; },
        get isSectionExploreActive() { return isSectionExploreActive; },
        get isChatMessagesActive() { return isChatMessagesActive; },
        get activeChatGroup() { return activeChatGroup; },
        get isChatMembersActive() { return isChatMembersActive; },
        get isSectionSettingsActive() { return isSectionSettingsActive; },
        get isSectionProfileActive() { return isSectionProfileActive; },
        get isSectionLoginActive() { return isSectionLoginActive; },
        get isSectionAccessibilityActive() { return isSectionAccessibilityActive; },
        get allMunicipalities() { return allMunicipalities; },
        get displayedMunicipalitiesCount() { return displayedMunicipalitiesCount; },
        set displayedMunicipalitiesCount(value) { displayedMunicipalitiesCount = value; },
        get allUniversities() { return allUniversities; },
        get displayedUniversitiesCount() { return displayedUniversitiesCount; },
        set displayedUniversitiesCount(value) { displayedUniversitiesCount = value; },
        popperInstances, allowMultipleActiveModules, closeOnClickOutside, closeOnEscape,
        ITEMS_PER_PAGE, get currentChatGroupUUID() { return currentChatGroupUUID; }
    };
    // --- FIN DE LA CORRECCIÓN ---
    
    const handlers = {
        closeMenuOptions, openMenuOptions, closeMenuSurface, openMenuSurface,
        handleNavigationChange, closeAllModules, openMessageOptions, openAttachDropdown,
        closeAttachDropdown, reportMessage, closeAccountActionModal, openAccountActionModal,
        handleProfileUpdate, handlePreferenceUpdate, applyTheme, loadUniversityGroups,
        refreshHomeView, displayGroups, showNewPasswordPane, saveNewPassword,
        handleDeleteAccount, handleSystemThemeChange, handleResize,
        closeAllSelectors, closeMessageOptions, renderDashboardView, renderDiscoveryView, renderGroupCards
    };

    setupEventListeners(domElements, state, handlers);
    initializePageData();

    const handleDragClose = () => {
        if (moduleOptions.classList.contains('active')) {
            closeMenuOptions();
        }
    };

    initDragController(handleDragClose, () => isAnimating);

    updateLogState();
    console.log('ProjectLeviathan initialized with URL routing and dynamic modules support');
}

export { initMainController };