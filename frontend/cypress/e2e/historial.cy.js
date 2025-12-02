describe('Historial de Avances, Revisiones y Defensas', () => {
  // Simula login antes de cada test
    beforeEach(() => {
        cy.visit('http://localhost:5173/iniciarsesion');
        cy.get('input[name="email"]').type('daniel@daniel.com');
        cy.get('input[name="password"]').type('daniel1234');
        cy.get('button[type="submit"]').click();
        cy.url().should('include', '/dashboard'); // Asegura que entró
    });

    // ✅ Caso Válido 1: Ver historial completo
    it('CV-01: Estudiante ve su historial completo', () => {
        cy.visit('/historial');
        cy.get('.historial-item').should('have.length.gte', 1);
        cy.get('.historial-item .fecha').should('exist');
        cy.get('.historial-item .estado').should('exist');
        cy.get('.historial-item .comentario').should('exist');
    });

    // ✅ Caso Válido 2: Filtrar por tipo
    it('CV-02: Filtrar historial por tipo (ej: "revisión")', () => {
        cy.visit('/historial');
        cy.contains('Revisión').click(); // Botón de filtro
        cy.get('.historial-item').each(($item) => {
        cy.wrap($item).contains('Revisión').should('exist');
        });
    });

    // ❌ Caso Inválido 1: Acceso sin login
    it('CI-01: Usuario no autenticado intenta acceder', () => {
        cy.clearCookies();
        cy.visit('/historial');
        cy.url().should('include', '/login');
        cy.contains('Acceso denegado').should('not.exist'); // O mensaje de error
    });

    // ❌ Caso Inválido 2: Intentar ver historial de otro estudiante
    it('CI-02: Cambiar ID manualmente y ver historial ajeno', () => {
        cy.visit('/historial?studentId=999'); // ID de otro estudiante
        cy.contains('No tienes permiso').should('be.visible');
        // O redirige a /historial sin parámetros
        cy.url().should('not.include', 'studentId=999');
    });
});