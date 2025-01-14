import { expect } from 'chai';
import supertest from 'supertest';
import app from '../app.js'; // Asegúrate de que la ruta sea correcta
import pkg from '../app/models/index.js'; // Importa el módulo completo

const { sequelize } = pkg; // Extrae sequelize
const request = supertest(app);

describe('GET /', function() {
  it('should return 200 OK', function(done) {
    request.get('/')
      .expect(200, done);
  });
});

describe('Database Connection', function() {
  it('should connect to the database successfully', function(done) {
    sequelize.authenticate()
      .then(() => {
        done();
      })
      .catch(err => {
        done(err);
      });
  });
});

