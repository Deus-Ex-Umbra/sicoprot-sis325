/// <reference types="cypress" />

describe('Motor de Búsqueda en Repositorio de Proyectos', () => {

    beforeEach(() => {
        cy.visit('http://localhost:5173/');
        // Asumimos que ya estás autenticado como estudiante
        // (como en tus otros tests: no se prueba login, se parte del acceso)
    });

    // ✅ CV-01: Búsqueda por palabra clave
    it('CV-01: Búsqueda por palabra clave devuelve resultados relevantes', () => {
        cy.visit('http://localhost:5173/repositorio');

        // Escribe en el campo de búsqueda
        cy.get('input[placeholder*="Buscar"], input[type="search"], #busqueda')
        .type('machine learning{enter}');

        // Verifica que haya al menos un resultado
        cy.get('.proyecto-item').should('have.length.gte', 1);

        // Verifica que al menos un resultado contenga la palabra (en título, resumen o keywords)
        cy.get('.proyecto-item').first().then(($item) => {
        const texto = $item.text().toLowerCase();
        expect(texto).to.include('machine');
        });
    });

    // ✅ CV-02: Búsqueda por frase
    it('CV-02: Búsqueda por frase devuelve resultados que coinciden con la combinación', () => {
        cy.visit('http://localhost:5173/repositorio');

        cy.get('input[placeholder*="Buscar"], input[type="search"], #busqueda')
        .type('gestión académica{enter}');

        cy.get('.proyecto-item').should('have.length.gte', 1);
        cy.get('.proyecto-item').first().should('contain', 'gestión');
        cy.get('.proyecto-item').first().should('contain', 'académica');
    });

    // ❌ CI-01: Término sin resultados
    it('CI-01: Búsqueda sin coincidencias muestra mensaje de "no encontrado"', () => {
        cy.visit('http://localhost:5173/repositorio');

        cy.get('input[placeholder*="Buscar"], input[type="search"], #busqueda')
        .type('xyz123nocoincide{enter}');

        // Debe mostrar mensaje claro
        cy.contains(/no (se encontraron|hay resultados|resultados)/i).should('be.visible');
    });

    // ❌ CI-02: Acceso sin autenticación
    it('CI-02: Usuario no autenticado no puede acceder al repositorio', () => {
        cy.clearCookies();
        cy.visit('http://localhost:5173/repositorio');

        // Debe redirigir a login
        cy.url().should('include', '/login');
    });

});