<div class="section-content overflow-y <?php echo $CURRENT_SECTION === 'explore' ? 'active' : 'disabled'; ?>" data-section="sectionExplore">
    <div class="discovery-container">
        <div class="discovery-hero">
            <div class="discovery-hero-content">
                <h1>Explora Comunidades</h1>
                <p>Encuentra y únete a comunidades de tu interés en Tamaulipas.</p>
                <div class="discovery-search-bar">
                    <span class="material-symbols-rounded search-icon">search</span>
                    <input type="text" id="community-search-input" class="search-input" placeholder="Buscar por nombre...">
                </div>
            </div>
        </div>
        <div class="discovery-tabs">
            <div class="tab-item active" data-tab="municipalities">
                <span class="material-symbols-rounded">location_city</span>
                <span>Municipios</span>
            </div>
            <div class="tab-item" data-tab="universities">
                <span class="material-symbols-rounded">school</span>
                <span>Universidades</span>
            </div>
        </div>
        
        <div class="discovery-content">
            <div class="discovery-content-section active" data-section-id="municipalities">
                <div class="discovery-grid">
                    </div>
                <div class="load-more-container">
                    <button class="load-more-button" data-type="municipalities">Cargar más</button>
                </div>
            </div>

            <div class="discovery-content-section" data-section-id="universities">
                <div class="explore-filters-container">
                    <div class="university-filters">
                         <div class="explore-control-group">
                            <div class="selector-input" data-action="toggleSelector" id="university-municipality-selector-button">
                                <div class="selected-value">
                                    <div class="selected-value-icon left">
                                        <span class="material-symbols-rounded">filter_list</span>
                                    </div>
                                    <span class="selected-value-text">Filtrar por municipio</span>
                                </div>
                                <div class="selected-value-icon">
                                    <span class="material-symbols-rounded">arrow_drop_down</span>
                                </div>
                            </div>
                            <div class="module-content module-selector body-title disabled" data-module="moduleSelector" id="university-municipality-selector-dropdown">
                                 <div class="menu-content overflow-y">
                                    <div class="menu-body overflow-y">
                                        <div class="menu-list">
                                            </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="discovery-grid">
                    </div>
                 <div class="load-more-container">
                    <button class="load-more-button" data-type="universities">Cargar más</button>
                </div>
            </div>
        </div>
    </div>
</div>