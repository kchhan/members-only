const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const MessageSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  title: { type: String, required: true },
  text: { type: String, required: true },
  added: { type: String, default: Date.now },
});

// Export model
module.exports = mongoose.model('Message', MessageSchema);
