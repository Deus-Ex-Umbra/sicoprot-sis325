/// <reference types="cypress" />

describe('Pruebas de Registro de Usuario', () => {
  
  beforeEach(() => {
    cy.visit('http://localhost:5173/');
    cy.get('.text-sm > .text-primary').click();
  });

  it('Debería permitir a un usuario solicitar el registro exitosamente', () => {
    
    cy.wait(500);

    cy.get('#nombre').type('NombrePrueba');
    cy.get('#apellido').type('ApellidoPrueba');
    cy.get('#correo').type('algo-aqui-1@test.com');
    
    cy.get('#rol').click();
    cy.get('[role="option"]').contains('Estudiante').click();
    
    cy.get('#contrasena').type('0123456789');
    cy.get('#confirmar').type('0123456789');

    cy.get('.inline-flex').click();

    cy.wait(500);

    cy.get('.inline-flex').click();
  });

});