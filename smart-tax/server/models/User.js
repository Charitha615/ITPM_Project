const db = require('../config/db');
const bcrypt = require('bcryptjs');

class User {
  static async create({
    name,
    email,
    password,
    address,
    contact_number,
    gender,
    nationality,
    id_number,
    role = 'user'
  }) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await db.query(
      `INSERT INTO users 
      (name, email, password, address, contact_number, gender, nationality, id_number, role) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, email, hashedPassword, address, contact_number, gender, nationality, id_number, role]
    );
    return result.insertId;
  }

  static async findByEmail(email) {
    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0];
  }

  static async findById(id) {
    const [rows] = await db.query(
      `SELECT id, name, email, address, contact_number, gender, nationality, id_number, role 
      FROM users WHERE id = ?`,
      [id]
    );
    return rows[0];
  }

  static async comparePasswords(candidatePassword, hashedPassword) {
    return await bcrypt.compare(candidatePassword, hashedPassword);
  }

  static async initializeAdmin() {
    const adminEmail = 'admin@gmail.com';
    const existingAdmin = await this.findByEmail(adminEmail);

    if (!existingAdmin) {
      await this.create({
        name: 'Admin',
        email: adminEmail,
        password: 'admin',
        role: 'admin'
      });
      console.log('Admin user created successfully');
    }
  }
}

module.exports = User;