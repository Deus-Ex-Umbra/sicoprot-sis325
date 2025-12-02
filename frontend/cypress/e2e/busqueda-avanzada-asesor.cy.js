/// <reference types="cypress" />

describe('Búsqueda avanzada en repositorio (como asesor)', () => {

    beforeEach(() => {
        cy.visit('http://localhost:5173/');
        // Asumimos que ya estás autenticado como asesor
    });

    // ✅ CV-01: Filtrar por año
    it('CV-01: Filtrar proyectos por año (2024)', () => {
        cy.visit('http://localhost:5173/asesor/repositorio');

        // Selecciona el año 2024
        cy.get('#anio, [name="anio"], select').select('2024');

        // Dispara búsqueda (si hay botón) o espera carga automática
        cy.get('button[type="submit"], .btn-buscar').click({ force: true });

        // Verifica que todos los resultados sean de 2024
        cy.get('.proyecto-item').should('have.length.gte', 1);
        cy.get('.proyecto-item .anio').each(($anio) => {
        expect($anio.text()).to.include('2024');
        });
    });

    // ✅ CV-02: Combinar filtros: carrera + asesor
    it('CV-02: Filtrar por carrera (Ingeniería) y asesor (Dr. López)', () => {
        cy.visit('http://localhost:5173/asesor/repositorio');

        cy.get('#carrera').select('Ingeniería');
        cy.get('#asesor').select('Dr. López');

        cy.get('button[type="submit"], .btn-buscar').click({ force: true });

        // Verifica que todos los resultados coincidan con ambos filtros
        cy.get('.proyecto-item').each(($item) => {
        cy.wrap($item).contains('Ingeniería').should('exist');
        cy.wrap($item).contains('Dr. López').should('exist');
        });
    });

    // ❌ CI-01: Año sin resultados
    it('CI-01: Filtro por año sin proyectos (1990)', () => {
        cy.visit('http://localhost:5173/asesor/repositorio');

        cy.get('#anio').select('1990');
        cy.get('button[type="submit"], .btn-buscar').click({ force: true });

        cy.contains(/no (se encontraron|hay resultados)/i).should('be.visible');
    });

    // ❌ CI-02: Acceso no autorizado
    it('CI-02: Usuario no autorizado intenta acceder a búsqueda avanzada', () => {
        cy.clearCookies(); // simula no estar logueado
        cy.visit('http://localhost:5173/asesor/repositorio');

        // Debe redirigir a login
        cy.url().should('include', '/login');
    });

});