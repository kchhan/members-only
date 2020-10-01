const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const UserSchema = new Schema({
  first_name: { type: String, maxlength: 30, required: true },
  family_name: { type: String, maxlength: 30, required: true },
  username: { type: String, maxlengh: 15, required: true },
  password: { type: String, required: true },
  membership: {
    type: String,
    required: true,
    enum: ['Non-Member', 'Member', 'Admin'],
    default: 'Non-Member',
  },
  member_since: { type: String },
  messages: [{ type: Schema.Types.ObjectId, ref: 'Message' }],
});

// export model
module.exports = mongoose.model('User', UserSchema);
