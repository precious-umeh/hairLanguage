"use client";

import { useContext, createContext, useState, useEffect } from "react";
import server, { assetUrl, BASE_URL } from "@/app/(main)/utils/axiosClient";
import toast, { Toaster } from "react-hot-toast";
import { useSWRConfig } from "swr";

const ProductContext = createContext();

export function ProductProvider({ children }) {
  // List of all products from backend
  const [products, setProducts] = useState([]);
  // state for holding images before sending to backend and also displaying selected images
  const [images, setImages] = useState([]);
  // List of all colors from backend
  const [colors, setColors] = useState([]);
  // state to store selected color ids
  const [selectedColorIds, setSelectedColorIds] = useState([]);
  // state to show/hide addProductModal
  const [showProductModal, setShowProductModal] = useState(false);
  // state to show/hide colorLibrary
  const [showcolorLibrary, setShowColorLibrary] = useState(false);
  // state to manage image upload method
  const [useUrl, setUseUrl] = useState(false);
  // state to manage image upload drag&drop
  const [isDragging, setIsDragging] = useState(false);
  // state to hold image urls
  const [imageUrl, setImageUrl] = useState("");
  // loading state
  const [loading, setLoading] = useState(false);
  // edit mode state
  const [editMode, setEditMode] = useState(false);
  // state to hold id of current product being edited
  const [editingId, setEditingId] = useState(null);
  // state to hold productForm details
  const initialState = {
    productName: "",
    description: "",
    price: "",
    inventory: "",
    category: "",
    wigType: "",
    texture: "",
    lengths: [],
  };
  const [productForm, setProductForm] = useState(initialState);
  const categories = ["wigs", "bundles", "frontals", "closures"];
  const wigTypes = ["vietnamese", "hd-lace", "bob", "headband"];
  const textures = ["straight", "curly", "wavy"];
  const lengthPresets = [
    { label: "short", range: [8, 10, 12, 14] },
    { label: "medium", range: [16, 18, 20] },
    { label: "long", range: [22, 24, 26, 28, 30] },
  ];
  const { mutate } = useSWRConfig();

  /**
   * Drag & Drop Handlers for Images
   */
  // handles the dragover event within the file dropzone
  function handleDragOver(e) {
    e.preventDefault();
    setIsDragging(true);
  }

  // handles dragleave event
  function handleDragLeave() {
    setIsDragging(false);
  }

  // handles the drop event for uploading files
  // gets files out of the data transfer event and adds them, to the images state
  function handleDrop(e) {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setImages((prev) => [...prev, ...Array.from(e.dataTransfer.files)]);
    }
  }

  /**
   * Handles local file selection through the file explorer.
   */
  // handles manual file input changes
  // adds selected files through the file explorer to the images state
  function handleFileChange(e) {
    if (e.target.files && e.target.files.length > 0) {
      setImages((prev) => [...prev, ...Array.from(e.target.files)]);
    }
  }

  /**
   * Adds an image URL from the input field to the images array.
   */
  // submits the current image url string to the images state
  function handleAddImageUrl() {
    if (imageUrl.trim()) {
      setImages((prev) => [...prev, imageUrl.trim()]);
      // clear imageUrl input field
      setImageUrl("");
    }
  }

  // Function to clean up a specific object URL
  const revokeImageUrl = (img) => {
    if (typeof img === "string" && img.startsWith("blob:")) {
      URL.revokeObjectURL(img);
    }
  };

  /**
   * Removes an image from the current list (either a File or a URL).
   */
  // removes an image from the current images list using its index
  // function removeImage(index) {
  //   setImages((prev) => prev.filter((_, i) => i !== index));
  // }
  function removeImage(index) {
    const imageToRemove = images[index];
    // If it's an object URL string, revoke it
    if (
      typeof imageToRemove === "string" &&
      imageToRemove.startsWith("blob:")
    ) {
      URL.revokeObjectURL(imageToRemove);
    }
    setImages((prev) => prev.filter((_, i) => i !== index));
  }

  /**
   * Handles productForm change
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProductForm({ ...productForm, [name]: value });
  };

  /**
   * Product Length Handler
   */
  // handle length selection
  const toggleLengthSelection = (size) => {
    setProductForm((prev) => {
      const isSelected = prev.lengths.some((l) => l.size === size);

      if (isSelected) {
        return {
          ...prev,
          lengths: prev.lengths.filter((l) => l.size !== size),
        };
      } else {
        return {
          ...prev,
          // When selecting a new length, default its price to the current base price
          lengths: [
            ...prev.lengths,
            { size, price: prev.price || "", inventory: 0 },
          ],
        };
      }
    });
  };

  // Add a NEW function to handle price changes for specific lengths
  const handleLengthPriceChange = (size, newPrice) => {
    const numericPrice = newPrice === "" ? "" : Number(newPrice);

    setProductForm((prev) => ({
      ...prev,
      lengths: prev.lengths.map((l) =>
        l.size === size ? { ...l, price: numericPrice } : l,
      ),
    }));
  };

  // Handle length inventory change
  const handleLengthInventoryChange = (size, newInventory) => {
    const numericInventory = newInventory === "" ? 0 : Number(newInventory);

    setProductForm((prev) => ({
      ...prev,
      lengths: prev.lengths.map((l) =>
        l.size === size ? { ...l, inventory: numericInventory } : l,
      ),
    }));
  };

  // Get total stock
  const getTotalStock = (product) => {
    // If the product has no length variations, return the base inventory
    if (!product.lengths || product.lengths.length === 0) {
      return product.inventory || 0;
    }

    // Otherwise sum up the inventory of all lengths
    return product.lengths.reduce(
      (acc, curr) => acc + (curr.inventory || 0),
      0,
    );
  };

  /**
   * Function to handle adding product
   */
  const addProduct = async function () {
    const hasEmptyPrices = productForm.lengths.some(
      (l) => l.price === "" || l.price <= 0,
    );

    if (hasEmptyPrices) {
      toast.error("Please set a valid price for all selected lengths");
      return false;
    }

    setLoading(true);

    try {
      const formData = new FormData();

      Object.keys(productForm).forEach((key) => {
        if (key !== "lengths") {
          formData.append(key, productForm[key]);
        }
      });

      formData.append("lengths", JSON.stringify(productForm.lengths));

      selectedColorIds.forEach((id) => {
        formData.append("availableColors", id);
      });

      images.forEach((img) => {
        if (img instanceof File) {
          formData.append("images", img);
        } else if (typeof img === "string") {
          const cleanedPath = img.replace(BASE_URL, "");
          formData.append("images", cleanedPath);
        }
      });

      const response = await server.post("/api/products", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      mutate("/api/products");

      // setProducts([...products, response.data?.data]);

      setProducts((prev) => [...prev, response.data?.data]);

      toast.success("Product added successfully");

      return true;
    } catch (error) {
      toast.error(
        `Error adding product: ${error.response?.data?.message || error.message}`,
      );
      return false;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Prepares the form for editing an existing product.
   * Populates states with current product data.
   */
  function edit(product) {
    setProductForm({
      productName: product.productName || "",
      description: product.description || "",
      price: product.price ?? "",
      inventory: product.inventory ?? "", // Fallback to empty string
      category: product.category || "",
      wigType: product.wigType || "",
      texture: product.texture || "",
      lengths: product.lengths || [],
    });

    const colorIds =
      product.availableColors.map((col) =>
        typeof col === "object" ? col._id : col,
      ) || [];
    setSelectedColorIds(colorIds);

    setImages(product.images.map((img) => assetUrl(img)));

    setEditingId(product._id);
    setShowProductModal(true);
    setEditMode(true);
  }

  /**
   * Sends a PATCH request to update an existing product.
   * Correctly merges existing images with new uploads.
   */
  const updateProduct = async function () {
    const hasEmptyPrices = productForm.lengths.some(
      (l) => l.price === "" || l.price <= 0,
    );

    if (hasEmptyPrices) {
      toast.error("Please set a valid price for all selected lengths");

      return false;
    }

    setLoading(true);

    try {
      const formData = new FormData();

      Object.keys(productForm).forEach((key) => {
        if (key !== "lengths") {
          formData.append(key, productForm[key]);
        }
      });

      formData.append("lengths", JSON.stringify(productForm.lengths));
      selectedColorIds.forEach((id) => formData.append("availableColors", id));

      images.forEach((img) => {
        if (img instanceof File) {
          formData.append("images", img);
        } else if (typeof img === "string") {
          const cleanedPath = img.replace(BASE_URL, "");
          formData.append("images", cleanedPath);
        }
      });

      const response = await server.patch(
        `/api/products/${editingId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      mutate("/api/products");

      // setProducts(
      //   products.map((p) => (p._id === editingId ? response.data.data : p)),
      // );

      setProducts((prev) =>
        prev.map((p) => (p._id === editingId ? response.data.data : p)),
      );

      toast.success("Product updated successfully");

      return true;
    } catch (error) {
      toast.error(
        `Error updating product: ${error.response?.data?.message || error.message}`,
      );
      return false;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Form Submission Handler
   */
  const handleFormSubmission = async function (e) {
    e.preventDefault();

    const success = editMode ? await updateProduct() : await addProduct();

    if (success) {
      setProductForm(initialState);
      setSelectedColorIds([]);
      setImages([]);
      setEditMode(false);
      setEditingId(null);
      setShowProductModal(false);
    }
  };

  /**
   * Handles close modal
   */
  const closeModal = () => {
    // Revoke all preview URLs before clearing the state
    images.forEach((img) => {
      if (typeof img === "string" && img.startsWith("blob:")) {
        URL.revokeObjectURL(img);
      }
    });

    setProductForm(initialState);
    setImages([]);
    setSelectedColorIds([]);
    setEditMode(false);
    setEditingId(null);
    setShowProductModal(false);
  };

  /**
   * Deletes a product by ID and refreshes the list.
   */
  const deleteProduct = async function (id) {
    if (!id) return;
    setLoading(true);

    try {
      await server.delete(`/api/products/${id}`);

      setProducts((prev) => prev.filter((p) => p._id !== id));
      mutate("/api/products");

      toast.success("Product deleted successfully");
    } catch (error) {
      toast.error(
        `Error deleting product: ${error.response?.data?.message || error.message}`,
      );
    } finally {
      setLoading(false);
    }
  };

  /**
   * Fetch products from the backend
   */
  const fetchProducts = async () => {
    try {
      const response = await server.get("/api/products");
      setProducts(response.data?.products || []);
    } catch (error) {
      console.error("Error fetching products: ", error.message);
    }
  };

  /**
   * Color Handlers
   */
  // fetch colors from the backend
  const fetchColors = async () => {
    try {
      const response = await server.get("/api/colors");
      setColors(response.data?.data || []);
    } catch (error) {
      console.error("Error fetching colors: ", error.message);
    }
  };

  // handle color selection
  const toggleColorSelection = (id) => {
    setSelectedColorIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  // Inital products load
  useEffect(() => {
    fetchProducts();
  }, []);

  // Initial colors load
  useEffect(() => {
    fetchColors();
  }, []);

  return (
    <ProductContext.Provider
      value={{
        products,
        showProductModal,
        setShowProductModal,
        productForm,
        setProductForm,
        closeModal,
        categories,
        wigTypes,
        textures,
        lengthPresets,
        handleChange,
        showcolorLibrary,
        setShowColorLibrary,
        selectedColorIds,
        setSelectedColorIds,
        colors,
        setColors,
        toggleColorSelection,
        toggleLengthSelection,
        handleLengthPriceChange,
        handleLengthInventoryChange,
        getTotalStock,
        fetchColors,
        loading,
        images,
        setImages,
        useUrl,
        setUseUrl,
        isDragging,
        handleDragOver,
        handleDragLeave,
        handleDrop,
        handleFileChange,
        handleAddImageUrl,
        removeImage,
        edit,
        editMode,
        setEditMode,
        handleFormSubmission,
        deleteProduct,
      }}
    >
      <Toaster position="top-left" />

      {children}
    </ProductContext.Provider>
  );
}

export function useProducts() {
  const context = useContext(ProductContext);
  return context;
}

// const toggleLengthSelection = (size) => {
//   setProductForm((prev) => ({
//     ...prev,
//     lengths: prev.lengths.includes(size)
//       ? prev.lengths.filter((l) => l !== size)
//       : [...prev.lengths, size],
//   }));
// };

//       productForm.lengths.forEach((len) => {
//         formData.append("lengths", len);
//       });

// Update
// Object.keys(productForm).forEach((key) => {
//   if (key !== "lengths") formData.append(key, productForm[key]);
// });
// productForm.lengths.forEach((len) => formData.append("lengths", len));
