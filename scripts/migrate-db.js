require('dotenv').config();
const mongoose = require('mongoose');

const oldUri = process.env.MONGODB_URI_OLD;
const newUri = process.env.MONGODB_URI_NEW || process.env.MONGODB_URI;
const force = process.env.MIGRATE_FORCE === '1';

if (!oldUri || !newUri) {
  console.error('Missing MONGODB_URI_OLD or MONGODB_URI_NEW/MONGODB_URI.');
  process.exit(1);
}

const targetCollections = [
  'taxonomies',
  'support_requests',
  'tips',
  'users',
  'sessions'
];

const getCollectionNames = async (conn) => {
  const list = await conn.db.listCollections().toArray();
  return list.map((c) => c.name);
};

const collectionExists = (names, name) => names.includes(name);

const fetchAll = async (conn, name) => {
  const names = await getCollectionNames(conn);
  if (!collectionExists(names, name)) return [];
  return conn.db.collection(name).find({}).toArray();
};

const countDocs = async (conn, name) => {
  const names = await getCollectionNames(conn);
  if (!collectionExists(names, name)) return 0;
  return conn.db.collection(name).countDocuments();
};

const clearCollection = async (conn, name) => {
  const names = await getCollectionNames(conn);
  if (!collectionExists(names, name)) return;
  await conn.db.collection(name).deleteMany({});
};

const stripInternal = (doc) => {
  const { __v, ...rest } = doc;
  return rest;
};

const toDate = (value, fallback) => {
  if (!value) return fallback;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? fallback : date;
};

const withTimestamps = (doc) => {
  const base = stripInternal(doc);
  const createdAt = toDate(base.createdAt, new Date());
  const updatedAt = toDate(base.updatedAt, createdAt);
  return { ...base, createdAt, updatedAt };
};

const normalizeNotes = (notes, fallbackDate) => {
  if (!Array.isArray(notes)) return [];
  return notes.map((n) => ({
    note: n?.note || '',
    createdAt: toDate(n?.createdAt, fallbackDate)
  }));
};

async function migrate() {
  const oldConn = await mongoose.createConnection(oldUri).asPromise();
  const newConn = await mongoose.createConnection(newUri).asPromise();

  try {
    const [categories, tags, tickets, contacts, tips, users, sessions] = await Promise.all([
      fetchAll(oldConn, 'categories'),
      fetchAll(oldConn, 'tags'),
      fetchAll(oldConn, 'tickets'),
      fetchAll(oldConn, 'contacts'),
      fetchAll(oldConn, 'tips'),
      fetchAll(oldConn, 'users'),
      fetchAll(oldConn, 'sessions')
    ]);

    console.log('Found:', {
      categories: categories.length,
      tags: tags.length,
      tickets: tickets.length,
      contacts: contacts.length,
      tips: tips.length,
      users: users.length,
      sessions: sessions.length
    });

    const taxonomies = [
      ...categories.map((doc) => ({ ...withTimestamps(doc), type: 'category' })),
      ...tags.map((doc) => ({ ...withTimestamps(doc), type: 'tag' }))
    ];

    const supportRequests = [
      ...tickets.map((doc) => {
        const stamped = withTimestamps(doc);
        return {
          ...stamped,
          type: 'ticket',
          status: stamped.status || 'NEW',
          adminNotes: normalizeNotes(stamped.adminNotes, stamped.updatedAt)
        };
      }),
      ...contacts.map((doc) => ({ ...withTimestamps(doc), type: 'contact' }))
    ];

    for (const name of targetCollections) {
      const count = await countDocs(newConn, name);
      if (count > 0 && !force) {
        throw new Error(
          `Target collection "${name}" has ${count} docs. Set MIGRATE_FORCE=1 to overwrite.`
        );
      }
    }

    if (force) {
      for (const name of targetCollections) {
        await clearCollection(newConn, name);
      }
    }

    if (taxonomies.length) {
      await newConn.db.collection('taxonomies').insertMany(taxonomies);
    }
    if (supportRequests.length) {
      await newConn.db.collection('support_requests').insertMany(supportRequests);
    }
    if (tips.length) {
      await newConn.db.collection('tips').insertMany(tips.map(stripInternal));
    }
    if (users.length) {
      await newConn.db.collection('users').insertMany(users.map(stripInternal));
    }
    if (sessions.length) {
      await newConn.db.collection('sessions').insertMany(sessions.map(stripInternal));
    }

    console.log('Migration completed.');
  } finally {
    await oldConn.close();
    await newConn.close();
  }
}

migrate().catch((err) => {
  console.error(err);
  process.exit(1);
});
