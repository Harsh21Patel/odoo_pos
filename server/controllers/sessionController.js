import Session from '../models/Session.js';

// GET current open session
export const getCurrentSession = async (req, res) => {
  try {
    const session = await Session.findOne({ status: 'open' }).populate('openedBy', 'name');
    res.json(session);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET all sessions
export const getSessions = async (req, res) => {
  try {
    const sessions = await Session.find()
      .populate('openedBy', 'name')
      .populate('closedBy', 'name')
      .sort('-createdAt');
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST open session
export const openSession = async (req, res) => {
  try {
    const existing = await Session.findOne({ status: 'open' });
    if (existing) return res.status(400).json({ message: 'A session is already open', session: existing });

    const session = await Session.create({
      openedBy: req.user._id,
      openingBalance: req.body.openingBalance || 0
    });

    await session.populate('openedBy', 'name');
    res.status(201).json(session);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// PUT close session
export const closeSession = async (req, res) => {
  try {
    const session = await Session.findOne({ status: 'open' });
    if (!session) return res.status(404).json({ message: 'No open session found' });

    session.status = 'closed';
    session.closedBy = req.user._id;
    session.closedAt = new Date();
    session.closingBalance = req.body.closingBalance || 0;
    await session.save();

    res.json(session);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};