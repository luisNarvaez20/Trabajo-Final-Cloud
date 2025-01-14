import { expect } from 'chai';
import supertest from 'supertest';
import app from '../app.js'; // Asegúrate de que la ruta sea correcta
import pkg from '../app/models/index.js'; // Importa el módulo completo

const { sequelize } = pkg; // Extrae sequelize
const request = supertest(app);

describe('CRUD de Destinatario', function() {
  before(async function() {
    await sequelize.sync({ force: true }); // Reinicia la base de datos antes de las pruebas
  });

  let destinatarioId;

  it('debería crear un nuevo destinatario', function(done) {
    request.post('/destinatario/create')
      .send({
        nombres: 'Juan',
        apellidos: 'Perez',
        correo: 'juan.perez@example.com'
      })
      .expect(201)
      .end((err, res) => {
        if (err) return done(err);
        destinatarioId = res.body.id;
        done();
      });
  });

  it('debería listar todos los destinatarios', function(done) {
    request.get('/destinatario/findAll')
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body).to.be.an('array');
        done();
      });
  });

  it('debería obtener un destinatario por ID', function(done) {
    request.get(`/destinatario/findOne/${destinatarioId}`)
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body).to.have.property('id', destinatarioId);
        done();
      });
  });

  it('debería actualizar un destinatario por ID', function(done) {
    request.put(`/destinatario/update/${destinatarioId}`)
      .send({
        nombres: 'Juan Actualizado',
        apellidos: 'Perez Actualizado',
        correo: 'juan.perez.actualizado@example.com'
      })
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        done();
      });
  });

  it('debería borrar un destinatario por ID', function(done) {
    request.delete(`/destinatario/delete/${destinatarioId}`)
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        done();
      });
  });
});