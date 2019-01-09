const Menu = [
    {
        heading: 'Main Navigation',
    },
    {
        name: 'Start an Appraisal',
        path: '/appraisal/new',
        icon : 'icon-plus',
    },
    {
        name: 'View Appraisals',
        path: '/appraisal/',
        icon : 'icon-menu',
    },
    {
        name: 'Menu',
        icon: 'icon-speedometer',
        translate: 'sidebar.nav.MENU',
        label: { value: 1, color: 'info' },
        submenu: [{
            name: 'Submenu',
            translate: 'sidebar.nav.SUBMENU',
            path: 'submenu'
        }]
    }
];

export default Menu;
