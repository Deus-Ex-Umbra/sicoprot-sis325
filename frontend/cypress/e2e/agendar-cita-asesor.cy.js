/// <reference types="cypress" />

describe('Agendar citas como asesor', () => {

    beforeEach(() => {
        cy.visit('http://localhost:5173/');
        // Asumimos que ya estás autenticado como asesor
    });

    // ✅ CV-01: Agendar cita con estudiante asignado
    it('CV-01: Asesor agenda cita con estudiante asignado en horario disponible', () => {
        cy.visit('http://localhost:5173/asesor/agendar');

        // Selecciona un estudiante que asesora
        cy.get('#estudiante, [name="estudiante"]').select('123'); // ID de estudiante válido

        // Ingresa fecha y hora (usa formato que acepte tu input)
        cy.get('#fecha').type('2025-11-10'); // ajusta al formato de tu app (YYYY-MM-DD)
        cy.get('#hora').type('14:30');

        // Agendar
        cy.get('button[type="submit"], .btn-agendar').click();

        // Verifica confirmación
        cy.contains(/cita (agendada|confirmada|registrada)/i).should('be.visible');
    });

    // ✅ CV-02: Agendar con tema/nota
    it('CV-02: Asesor agrega tema a la cita', () => {
        cy.visit('http://localhost:5173/asesor/agendar');

        cy.get('#estudiante').select('123');
        cy.get('#fecha').type('2025-11-12');
        cy.get('#hora').type('10:00');
        cy.get('#tema').type('Revisión de metodología y cronograma');

        cy.get('button[type="submit"], .btn-agendar').click();

        cy.contains('Revisión de metodología').should('be.visible');
    });

    // ❌ CI-01: Horario ocupado
    it('CI-01: Intento de agendar en horario ya ocupado', () => {
        cy.visit('http://localhost:5173/asesor/agendar');

        cy.get('#estudiante').select('123');
        cy.get('#fecha').type('2025-11-10');
        cy.get('#hora').type('09:00'); // supón que este horario YA está ocupado

        cy.get('button[type="submit"], .btn-agendar').click();

        cy.contains(/no disponible|ocupado|conflicto/i).should('be.visible');
    });

    // ❌ CI-02: Estudiante no asignado
    it('CI-02: Asesor intenta agendar con estudiante no asignado', () => {
        cy.visit('http://localhost:5173/asesor/agendar');

        // ID de estudiante que NO asesora
        cy.get('#estudiante').select('999');

        cy.get('#fecha').type('2025-11-15');
        cy.get('#hora').type('11:00');

        cy.get('button[type="submit"], .btn-agendar').click();

        cy.contains(/no puedes agendar|no asignado|permiso/i).should('be.visible');
    });

});