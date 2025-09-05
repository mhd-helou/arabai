/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @returns {Promise<void> | void}
 */
const up = (pgm) => {
    pgm.createTable('users', {
        id: 'id',
        name: { type: 'varchar(50)', notNull: true },
        email: { type: 'varchar(100)', notNull: true, unique: true },
        password: { type: 'varchar(255)', notNull: true },
        role: { type: 'varchar(20)', notNull: true, default: 'user' },
        is_email_verified: { type: 'boolean', notNull: true, default: false },
        reset_password_token: { type: 'varchar(255)', notNull: false },
        reset_password_expire: { type: 'timestamp', notNull: false },
        created_at: {
            type: 'timestamp',
            notNull: true,
            default: pgm.func('current_timestamp'),
        },
        updated_at: {
            type: 'timestamp',
            notNull: true,
            default: pgm.func('current_timestamp'),
        },
    });

    pgm.createIndex('users', 'email');
    pgm.addConstraint('users', 'users_role_check', 'CHECK (role IN (\'user\', \'admin\'))');
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @returns {Promise<void> | void}
 */
const down = (pgm) => {
    pgm.dropTable('users');
};

module.exports = { up, down };