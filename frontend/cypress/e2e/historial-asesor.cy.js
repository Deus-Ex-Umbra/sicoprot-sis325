/// <reference types="cypress" />

describe('Acceso al historial de estudiantes (como asesor)', () => {

    beforeEach(() => {
        cy.visit('http://localhost:5173/');
        // Asumimos que ya estás autenticado como asesor
        // (igual que en tus otros tests: no se prueba login, se asume acceso)
    });

    // ✅ CV-01: Asesor ve historial completo de un estudiante que asesora
    it('CV-01: Asesor accede al historial de un estudiante asignado', () => {
        // Ejemplo: ruta con ID de un estudiante real que el asesor sí asesora
        cy.visit('http://localhost:5173/asesor/estudiante/123/historial');

        // Debe haber al menos un registro de avance/revisión/defensa
        cy.get('.avance-item, .historial-item').should('have.length.gte', 1);

        // Verifica que muestre tipo, fecha, estado y comentario
        cy.get('.avance-item').first().within(() => {
        cy.get('.tipo').should('exist');      // ej: "Avance", "Defensa"
        cy.get('.fecha').should('exist');
        cy.get('.estado').should('exist');    // ej: "Aprobado", "Pendiente"
        cy.get('.comentario').should('exist');
        });
    });

    // ✅ CV-02: Filtrar historial por tipo
    it('CV-02: Asesor filtra historial por tipo (ej: "Defensa")', () => {
        cy.visit('http://localhost:5173/asesor/estudiante/123/historial');

        // Supón que hay un botón o dropdown para filtrar
        cy.contains('Defensa').click(); // o cy.get('#filtro-defensa').click()

        // Todos los items deben ser de tipo "Defensa"
        cy.get('.avance-item').each(($item) => {
        cy.wrap($item).contains('Defensa').should('exist');
        });
    });

    // ❌ CI-01: Acceso a historial de estudiante NO asignado
    it('CI-01: Asesor intenta ver historial de estudiante que no asesora', () => {
        // ID de un estudiante que NO está asignado al asesor
        cy.visit('http://localhost:5173/asesor/estudiante/999/historial');

        // Debe mostrar error de permiso
        cy.contains(/(no tienes permiso|acceso denegado|no autorizado)/i).should('be.visible');
    });

    // ❌ CI-02: Usuario no autorizado (ej: estudiante) intenta acceder
    it('CI-02: Estudiante intenta acceder a ruta de asesor', () => {
        // Simula que un estudiante (u otro rol) intenta entrar
        // (en tu entorno de prueba, debes tener esta condición)
        cy.visit('http://localhost:5173/asesor/estudiante/123/historial');

        // No debe ver los datos → redirección o error
        cy.url().should('not.include', '/asesor/estudiante/123/historial');
        // O:
        // cy.contains('Acceso denegado').should('be.visible');
    });

});