/// <reference types="cypress" />

describe('Pruebas de Registro de Usuario (Data-Driven)', () => {

  const usuarios = [
    { correo: 'stinky@test.com', nombre: 'Stinky Harlow', rol: 'estudiante' },
    { correo: 'niko@test.com', nombre: 'Niko Voss Becker', rol: 'estudiante' },
    { correo: 'itchy@test.com', nombre: 'Itchy Quinn', rol: 'estudiante' },
    { correo: 'prego@test.com', nombre: 'Prego Lombardi', rol: 'estudiante' },
    { correo: 'zorf@test.com', nombre: 'Zorf Hagen', rol: 'estudiante' },
    { correo: 'clyde@test.com', nombre: 'Clyde Donovan Ellis', rol: 'estudiante' },
    { correo: 'vert@test.com', nombre: 'Vert Sinclair', rol: 'estudiante' },
    { correo: 'rufus@test.com', nombre: 'Rufus Blackwell', rol: 'estudiante' },
    { correo: 'meryl@test.com', nombre: 'Meryl Whitaker Grant', rol: 'estudiante' },
    { correo: 'wadsworth@test.com', nombre: 'Wadsworth Ellis', rol: 'estudiante' },
    { correo: 'seymour@test.com', nombre: 'Seymour Fletcher', rol: 'estudiante' },
    { correo: 'shrapnel@test.com', nombre: 'Shrapnel Steele Vaughn', rol: 'estudiante' },
    { correo: 'gumbo@test.com', nombre: 'Gumbo Roux', rol: 'estudiante' },
    { correo: 'blip@test.com', nombre: 'Blip Radar', rol: 'estudiante' },
    { correo: 'rhubarb@test.com', nombre: 'Rhubarb Fields Norton', rol: 'estudiante' },
    { correo: 'nimbus@test.com', nombre: 'Nimbus Cloud', rol: 'estudiante' },
    { correo: 'amp@test.com', nombre: 'Amp Volt', rol: 'estudiante' },
    { correo: 'gash@test.com', nombre: 'Gash Wilder Kane', rol: 'estudiante' },
    { correo: 'angie@test.com', nombre: 'Angie Brooks', rol: 'estudiante' },
    { correo: 'presto@test.com', nombre: 'Presto Magic', rol: 'estudiante' },
    { correo: 'brinkley@test.com', nombre: 'Brinkley Hayes', rol: 'estudiante' },
    { correo: 'nostradamus@test.com', nombre: 'Nostradamus Prophet Leigh', rol: 'estudiante' },
    { correo: 'stanley@test.com', nombre: 'Stanley Porter', rol: 'estudiante' },
    { correo: 'walter@test.com', nombre: 'Walter Reed', rol: 'estudiante' },
    { correo: 'sylvester@test.com', nombre: 'Sylvester Kane', rol: 'asesor' },
    { correo: 'balrog@test.com', nombre: 'Balrog Thorne', rol: 'asesor' },
    { correo: 'gus@test.com', nombre: 'Gus Malone Fletcher', rol: 'asesor' },
    { correo: 'destructor@test.com', nombre: 'Destructor Vaughn', rol: 'asesor' },
    { correo: 'ulysses@test.com', nombre: 'Ulysses Grant', rol: 'asesor' },
    { correo: 'psychosquid@test.com', nombre: 'Psychosquid Nero', rol: 'asesor' },
    { correo: 'bilaterus@test.com', nombre: 'Bilaterus Voss', rol: 'asesor' },
    { correo: 'cyrax@test.com', nombre: 'Cyrax Zoltan Hayes', rol: 'asesor' },
    { correo: 'minisylvester@test.com', nombre: 'Minisylvester Kane', rol: 'asesor' }
  ];

  it('Debería registrar a todos los usuarios uno por uno', () => {
    
    usuarios.forEach((usuario) => {
      
      cy.visit('http://localhost:5173/');
      cy.get('.text-sm > .text-primary').click();

      cy.wait(500); 

      const nombreCompleto = usuario.nombre.split(' ');
      const nombre = nombreCompleto[0];
      const apellido = nombreCompleto.slice(1).join(' ');
      const rolCapitalizado = usuario.rol.charAt(0).toUpperCase() + usuario.rol.slice(1);
      const contrasena = '0123456789';

      cy.get('#nombre').type(nombre);
      cy.get('#apellido').type(apellido);
      cy.get('#correo').type(usuario.correo);
      
      cy.get('#rol').click();
      cy.get('[role="option"]').contains(rolCapitalizado).click();
      
      cy.get('#contrasena').type(contrasena);
      cy.get('#confirmar').type(contrasena);

      cy.get('.inline-flex').click(); 

      cy.wait(500); 

      cy.get('.inline-flex').click(); 
    });

  });
});