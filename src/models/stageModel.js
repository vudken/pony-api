const mongoose = require('mongoose');

const stageSchema = new mongoose.Schema({
    name: { type: String, required: true },
    duration: { type: Number, required: true },
    color: { type: String, required: true },
    pumps: {
        pumpA: { type: Number, default: 0 },
        pumpB: { type: Number, default: 0 },
        pumpC: { type: Number, default: 0 },
    },
    position: { type: Number, unique: true, sparse: true }, // ✅ Unique & auto-assigned position
    active: { type: Boolean, default: true },
    startDate: { type: String, default: null },
}, { timestamps: true });

// ✅ Auto-assign position before saving if missing
stageSchema.pre("save", async function (next) {
    if (this.position === undefined || this.position === null) {
        const lastStage = await this.constructor.findOne({ active: true }).sort({ position: -1 });
        this.position = lastStage ? lastStage.position + 1 : 1; // ✅ Increment from last position
    }
    next();
});

module.exports = mongoose.model('Stage', stageSchema);
