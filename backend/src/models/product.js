import mongoose from "mongoose";
import slugify from "slugify";

const productSchema = new mongoose.Schema(
  {
    productName: { type: String, required: true },
    slug: { type: String, unique: true },
    price: { type: Number, required: true },
    inventory: { type: Number, default: 0 }, // Global inventory for products without lengths
    description: { type: String, required: true },
    category: { type: String, required: true },
    wigType: { type: String },
    texture: { type: String },
    lengths: [
      {
        size: { type: Number, required: true },
        price: { type: Number, required: true },
        inventory: { type: Number, default: 0 }, // Specific inventory for this length
      },
    ],
    images: { type: [String], default: [] },
    availableColors: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Color",
      },
    ],
  },
  { timestamps: true },
);

productSchema.pre("save", async function () {
  //Only run this if the name is new or has been changed
  if (this.isModified("productName") || !this.slug) {
    const baseSlug = slugify(this.productName, {
      lower: true,
      strict: true,
    });

    let slug = baseSlug;
    let counter = 1;

    while (await this.constructor.findOne({ slug, _id: { $ne: this._id } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    this.slug = slug;
  }
});

const Product =
  mongoose.models.Product || mongoose.model("Product", productSchema);
export default Product;

// const Product = mongoose.model("Product", productSchema);
// lengths: { type: [Number] },
