class User {
  constructor(db) {
    this.db = db;
  }

  async create(userData) {
    const newUser = await this.db.users.insert(userData);
    return newUser;
  }

  async findByEmail(email) {
    const user = await this.db.users.findOne({ email });
    return user;
  }

  async findById(id) {
    const user = await this.db.users.findOne({ id });
    return user;
  }




  async updateById(id, updates) {
    const updatedUser = await this.db.users.update({ id }, updates);
    return updatedUser[0];
  }

  async findByResetToken(token) {
    const user = await this.db.users.findOne({
      reset_password_token: token,
      'reset_password_expire >': new Date()
    });
    return user;
  }

  async deleteById(id) {
    return await this.db.users.destroy({ id });
  }

  async findAll(limit = 50, offset = 0) {
    const users = await this.db.users.find({}, {
      limit,
      offset,
      order: [{ field: 'created_at', direction: 'desc' }]
    });
    return users;
  }
  async findByProviderAndId(provider,providerId) {
    const user = await this.db.users.findOne({
      provider,
      provider_id: providerId
    });
    return user;
  }
}
module.exports = User;