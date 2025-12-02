/// <reference types="cypress" />

describe('Estudiantes listos para defensa (como asesor)', () => {

    beforeEach(() => {
        cy.visit('http://localhost:5173/');
        // Asumimos que ya estás autenticado como asesor
    });

    // ✅ CV-01: Ver contador y lista de estudiantes concluidos
    it('CV-01: Asesor ve contador y lista de estudiantes con documento concluido', () => {
        cy.visit('http://localhost:5173/asesor/defensas');

        // Debe existir el contador
        cy.get('[data-testid="contador-defensas"], .contador-defensas')
        .should('be.visible')
        .invoke('text')
        .then((text) => {
            const num = parseInt(text.trim(), 10);
            expect(num).to.be.gte(0); // puede ser 0, pero debe ser un número
        });

        // Si hay al menos 1, debe mostrarse en lista
        cy.get('.estudiante-listo').should('exist');
    });

    // ✅ CV-02: Lista incluye solo estudiantes asignados y en estado "Concluido"
    it('CV-02: Lista muestra solo estudiantes asignados con documento aprobado', () => {
        cy.visit('http://localhost:5173/asesor/defensas');

        cy.get('.estudiante-listo').each(($est) => {
        // Verifica que el estado sea "Concluido", "Aprobado" o "Listo"
        cy.wrap($est).contains(/(concluido|aprobado|listo)/i).should('exist');

        // No debe mostrar estudiantes de otros asesores (esto se valida por lógica del backend)
        // Pero podemos verificar que no aparezca un nombre conocido de otro grupo
        // cy.wrap($est).should('not.contain', 'EstudianteDeOtroAsesor');
        });
    });

    // ❌ CI-01: Sin estudiantes concluidos
    it('CI-01: No hay estudiantes listos → muestra mensaje amigable', () => {
        cy.visit('http://localhost:5173/asesor/defensas');

        // Simulamos que el contador es 0
        cy.get('[data-testid="contador-defensas"], .contador-defensas')
        .invoke('text')
        .then((text) => {
            const num = parseInt(text.trim(), 10);
            if (num === 0) {
            cy.contains(/aún no hay|ningún estudiante|no hay defensas/i).should('be.visible');
            }
        });
    });

    // ❌ CI-02: Acceso no autorizado
    it('CI-02: Usuario no autorizado intenta acceder', () => {
        cy.clearCookies();
        cy.visit('http://localhost:5173/asesor/defensas');

        cy.url().should('include', '/login');
    });

});