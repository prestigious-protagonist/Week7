'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
    */

    
     
    await queryInterface.bulkInsert('Roles', [
      {
       name: 'Admin', 
       createdAt: new Date(),
       updatedAt: new Date()
      },
      {
        name: 'Customer', 
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
       name: 'Airline_Business' , 
       createdAt: new Date(),
       updatedAt: new Date()
      }
    ], {});

  },

  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */

    await queryInterface.bulkDelete('Roles', null, {});
  }
};
