<?php require_once 'config/init.php'; ?>
<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" type="text/css" href="<?php echo $BASE_URL; ?>/assets/css/styles.css">
    <link rel="stylesheet" type="text/css" href="<?php echo $BASE_URL; ?>/assets/css/settings.css">
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded" />
    <?php require_once 'config/dinamic-titles.php'; ?>
    <title><?php echo $pageTitle; ?></title>
    <meta name="description" content="ProjectLeviathan - Plataforma de comunidades">
    <link rel="canonical" href="<?php echo $BASE_URL . '/' . $CURRENT_PATH; ?>">

<script>
    window.PROJECT_CONFIG = {
        baseUrl: '<?php echo $BASE_URL; ?>',
        currentSection: '<?php echo $CURRENT_SECTION; ?>',
        currentSubsection: <?php echo $CURRENT_SUBSECTION ? '"' . $CURRENT_SUBSECTION . '"' : 'null'; ?>,
        currentId: <?php echo isset($CURRENT_ID) && $CURRENT_ID ? '"' . $CURRENT_ID . '"' : 'null'; ?>,
        currentPath: '<?php echo $CURRENT_PATH; ?>',
        routes: <?php echo json_encode(Router::getAllRoutes()); ?>,
        csrfToken: '<?php echo $_SESSION['csrf_token']; ?>',
        apiUrl: '<?php echo str_replace('ProjectLeviathan - Frontend', 'ProjectLeviathan - Backend/api/api_handler.php', getBaseUrl()); ?>',
        userPreferences: <?php echo isset($_SESSION['user_preferences']) ? json_encode($_SESSION['user_preferences']) : '{}'; ?>,
        // --- INICIO DE LA MODIFICACIÓN ---
        userId: <?php echo isset($_SESSION['user_id']) ? $_SESSION['user_id'] : 'null'; ?>,
        username: <?php echo isset($_SESSION['username']) ? json_encode($_SESSION['username']) : 'null'; ?>,
        wsApiUrl: '<?php echo str_replace('ProjectLeviathan - Frontend', 'ProjectLeviathan - Backend/api/api_handler.php', getBaseUrl()); ?>'
        // --- FIN DE LA MODIFICACIÓN ---
    };
</script>
    
    <script>
        (function() {
            const theme = window.PROJECT_CONFIG.userPreferences.theme || 'system';
            const docEl = document.documentElement;

            const applyTheme = (isDark) => {
                docEl.classList.remove(isDark ? 'light-theme' : 'dark-theme');
                docEl.classList.add(isDark ? 'dark-theme' : 'light-theme');
            };

            if (theme === 'system') {
                const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
                applyTheme(mediaQuery.matches);
            } else {
                applyTheme(theme === 'dark');
            }
        })();
    </script>
    </head>

<body>
    <div class="page-wrapper">
        <div class="main-content">
            <div class="general-content">
                <div class="general-content-top">
                    <?php include 'includes/layouts/header.php'; ?>
                </div>
                <div class="general-content-bottom">
                    <div class="general-content-scrolleable">
                        <?php include 'includes/modules/module-surface.php'; ?>
                        <?php include 'includes/sections/general-sections.php'; ?>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <?php include 'includes/modules/module-dialog.php'; ?>


    <script src="https://unpkg.com/@popperjs/core@2/dist/umd/popper.min.js"></script>
    <script type="module" src="<?php echo $BASE_URL; ?>/assets/js/app-init.js"></script>
</body>

</html>