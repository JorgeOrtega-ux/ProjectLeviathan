<div class="section-container">
    <?php if ($CURRENT_SECTION === '404'): ?>
        <div class="section-content active" data-section="section404">
            <div class="error-404">
                <span class="error-code">404</span>
                <h1>¡Ups! Página no encontrada</h1>
                <p>No pudimos encontrar la página que estás buscando. Es posible que haya sido movida o que ya no exista.</p>
                <a href="<?php echo $BASE_URL; ?>" class="btn-home">
                    <span>Volver a la página principal</span>
                </a>
            </div>
        </div>
    <?php else: ?>
        <?php include 'includes/sections/main/home-section.php'; ?>
        <?php include 'includes/sections/main/explore-section.php'; ?>
        
       
            <?php include 'includes/sections/main/chat-section.php'; ?>
    
        <div class="section-content overflow-y <?php echo ($CURRENT_SECTION === 'chat' && $CURRENT_SUBSECTION === 'members') ? 'active' : 'disabled'; ?>" data-section="sectionChatMembers">
            <div class="content-container">
                <div class="card">
                    <div class="card-header-container">
                        <div class="card-header">
                            <h2 id="members-group-title"></h2>
                            <p id="members-online-count"></p>
                        </div>
                    </div>
                </div>
                <div id="chat-members-list-page">
                    
                </div>
            </div>
        </div>
        
        <div class="section-content <?php echo $CURRENT_SECTION === 'settings' ? 'active' : 'disabled'; ?>" data-section="sectionSettings">
            <?php include 'includes/sections/settings/profile-section.php'; ?>
            <?php include 'includes/sections/settings/login-section.php'; ?>
            <?php include 'includes/sections/settings/accessibility-section.php'; ?>
        </div>
        

    <?php endif; ?>
</div>