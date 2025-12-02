/// <reference types="cypress" />

describe('Pruebas de Cronograma del Proyecto', () => {

    // Simulamos que ya estamos logueados como estudiante
    // (igual que en tus tests: no se prueba login, se asume acceso)
    beforeEach(() => {
        cy.visit('http://localhost:5173/');
        // Si tu app requiere estar en dashboard primero, ajusta esto
    });

    // ✅ CV-01: Ver cronograma en etapa actual
    it('CV-01: Estudiante ve fechas límite de su etapa actual', () => {
        cy.visit('http://localhost:5173/cronograma');

        // Verifica que se muestre al menos una fecha límite
        cy.get('.fecha-limite').should('exist');
        cy.get('.etapa').should('contain', 'Perfil'); // o "Propuesta", según tu caso

        // Verifica que haya actividades programadas
        cy.get('.actividad').should('have.length.gte', 2);
        cy.get('.actividad').each(($act) => {
        expect($act.text()).to.match(/(Entrega|Revisión|Defensa)/);
        });
    });

    // ✅ CV-02: Cronograma se actualiza al cambiar de etapa
    it('CV-02: Cronograma refleja nueva etapa tras avance', () => {
        cy.visit('http://localhost:5173/cronograma');

        // Simulamos que ya avanzamos (o la app lo muestra)
        cy.get('.etapa').should('not.contain', 'Propuesta');
        cy.get('.etapa').should('contain', 'Perfil');

        // Verifica que aparezca una actividad nueva de la etapa "Perfil"
        cy.contains('Defensa provisional').should('be.visible');
    });

    // ❌ CI-01: Acceso sin autenticación
    it('CI-01: Usuario no autenticado no puede ver cronograma', () => {
        // Borra cookies/sesión (simula no estar logueado)
        cy.clearCookies();
        cy.visit('http://localhost:5173/cronograma');

        // Debe redirigir a login o mostrar error
        cy.url().should('include', '/login');
        // O si no redirige, debe mostrar mensaje:
        // cy.contains('Acceso denegado').should('be.visible');
    });

    // ❌ CI-02: Estudiante sin proyecto
    it('CI-02: Estudiante sin proyecto ve mensaje de no disponibilidad', () => {
        // Suponemos que hay un usuario estudiante sin proyecto
        // (en tu entorno de prueba, debes tener este caso)
        cy.visit('http://localhost:5173/cronograma');
        
        cy.contains(/(no (tienes|hay)|asignado|disponible)/i).should('be.visible');
    });

});