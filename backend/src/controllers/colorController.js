import Color from "../models/color.js";

export async function createColor(req, res) {
  try {
    const { name, hex, type } = req.body;

    const color = new Color({ name, hex, type: type || "solid" });

    const savedColor = await color.save();

    res.status(201).json({
      message: "Color created successfully",
      data: savedColor,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error. Please try again later.",
      error: error.message,
    });
  }
}

export async function getColors(req, res) {
  try {
    const colors = await Color.find().sort({ createdAt: -1 });

    res.status(200).json({
      message: "Colors retrieved successfully",
      count: colors.length,
      data: colors,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error. Please try again later.",
      error: error.message,
    });
  }
}

export async function updateColors(req, res) {
  try {
    const { id } = req.params;
    const { name, hex, type } = req.body;

    const updatedColor = await Color.findByIdAndUpdate(
      id,
      { $set: { name, hex, type } },
      { returnDocument: "after", runValidators: true },
    );

    if (!updatedColor) {
      return res.status(404).json({ message: "Color not found" });
    }

    res.status(200).json({
      message: "Color updated successfully.",
      data: updatedColor,
    });
  } catch (error) {
    res.status(500).json({
      message: "Invalid ID format",
      error: error.message,
    });
  }
}

export async function deleteColor(req, res) {
  try {
    const { id } = req.params;
    const deletedColor = await Color.findByIdAndDelete(id);

    if (!deletedColor) {
      return res.status(404).json({
        message: "Color not found",
      });
    }

    res.status(200).json({ message: "Color deleted successfully." });
  } catch (error) {
    res.status(500).json({
      message: "Invalid ID format",
      error: error.message,
    });
  }
}
