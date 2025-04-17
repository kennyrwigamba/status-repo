if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/asstets/js/service-worker.js").then(() => {
    console.log("Service Worker Registered");
  });
}


document.addEventListener("DOMContentLoaded", () => {
  // Elements
  const dashedUploadAreas = document.querySelector('.upload-area');
  const uploadAreas = document.querySelectorAll(".uploadImageBtn");
  const fileInput = document.getElementById("fileInput");
  const canvas = document.getElementById("outputCanvas");
  const colorsDisplay = document.getElementById("colorsDisplay");
  const downloadBtn = document.getElementById("downloadBtn");
  const regenerateBtn = document.getElementById("regenerateBtn");

  // // Tab elements
  // const tabButtons = document.querySelectorAll(".tab-button");
  // const tabContents = document.querySelectorAll(".tab-content");

  // Gradient settings
  const gradientType = document.getElementById("gradientType");
  const gradientDirection = document.getElementById("gradientDirection");

  // Image settings
  const paddingInput = document.getElementById("padding");
  const imageScaleInput = document.getElementById("imageScale");
  const rotationInput = document.getElementById("rotation");
  const borderWidthInput = document.getElementById("borderWidth");
  const borderColorInput = document.getElementById("borderColor");
  const borderRadiusInput = document.getElementById("borderRadius");

  // Canvas settings
  const aspectRatioSelect = document.getElementById("aspectRatio");
  const customAspectControls = document.getElementById(
    "customAspectControls"
  );
  const customWidthInput = document.getElementById("customWidth");
  const customHeightInput = document.getElementById("customHeight");
  const canvasQualitySelect = document.getElementById("canvasQuality");

  // Custom color elements
  const customColor1 = document.getElementById("customColor1");
  const customColor2 = document.getElementById("customColor2");
  const customColor3 = document.getElementById("customColor3");
  const addColor1Btn = document.getElementById("addColor1");
  const addColor2Btn = document.getElementById("addColor2");
  const addColor3Btn = document.getElementById("addColor3");
  const resetColorsBtn = document.getElementById("resetColors");

  // Settings value display elements
  const imageScaleValue = document.getElementById('imageScaleValue');
  const paddingValue = document.getElementById('paddingValue');
  const rotationValue = document.getElementById('rotationValue');
  const borderWidthValue = document.getElementById('borderWidthValue');
  const borderRadiusValue = document.getElementById('borderRadiusValue');

  const ctx = canvas.getContext("2d");

  let originalImage = null;
  let extractedColors = [];
  let activeColors = [];
  let activeCustomColors = [];


  // Change the settings values
  // Image scale
  imageScaleInput.addEventListener('input', (e) => {
    const value = e.target.value;
    imageScaleValue.textContent = `${value}%`;
  });

  // Padding
  paddingInput.addEventListener('input', (e) => {
    const value = e.target.value;
    paddingValue.textContent = `${value}px`;
  });

  // Rotation
  rotationInput.addEventListener('input', (e) => {
    const value = e.target.value;
    rotationValue.textContent = `${value}°`;
  });

  // Border width
  borderWidthInput.addEventListener('input', (e) => {
    const value = e.target.value;
    borderWidthValue.textContent = `${value}px`;
  });

  // Border radius
  borderRadiusInput.addEventListener('input', (e) => {
    const value = e.target.value;
    borderRadiusValue.textContent = `${value}px`;
  });



  // // Tab functionality
  // tabButtons.forEach((button) => {
  //   button.addEventListener("click", () => {
  //     const tabId = button.getAttribute("data-tab");

  //     // Update active tab button
  //     tabButtons.forEach((btn) => btn.classList.remove("active"));
  //     button.classList.add("active");

  //     // Update active tab content
  //     tabContents.forEach((content) => {
  //       content.classList.remove("active");
  //       if (content.id === tabId + "Tab") {
  //         content.classList.add("active");
  //       }
  //     });
  //   });
  // });

  // Aspect ratio change handler
  aspectRatioSelect.addEventListener("change", () => {
    if (aspectRatioSelect.value === "custom") {
      customAspectControls.style.display = "flex";
    } else {
      customAspectControls.style.display = "none";
    }
    updateCanvas();
  });

  // Upload area click handler
  uploadAreas.forEach((uploadArea) => {
    uploadArea.addEventListener("click", () => {
        fileInput.click();
    });
  });

  // File input change handler
  fileInput.addEventListener("change", handleImageUpload);

  // File input change handler --- Hide the file input element
  fileInput.addEventListener("change", changeElementsAfterUpload);

  // Drag and drop handlers
  uploadAreas.forEach((uploadArea) => {
    uploadArea.addEventListener("dragover", (e) => {
        e.preventDefault();
        uploadArea.classList.add("active");
    });
  });

  uploadAreas.forEach((uploadArea) => {
    uploadArea.addEventListener("dragleave", () => {
        uploadArea.classList.remove("active");
    });
  });

  uploadAreas.forEach((uploadArea) => {
    uploadArea.addEventListener("drop", (e) => {
        e.preventDefault();
        uploadArea.classList.remove("active");

        if (e.dataTransfer.files.length) {
        fileInput.files = e.dataTransfer.files;
        handleImageUpload(e);
        }
    });
  });

  // Regenerate button handler
  regenerateBtn.addEventListener("click", () => {
    if (originalImage) {
      updateCanvas();
    }
  });

  // Download button handler
  downloadBtn.addEventListener("click", () => {
    const quality = parseFloat(canvasQualitySelect.value);

    // Create a temporary canvas for the final export
    const exportCanvas = document.createElement("canvas");
    exportCanvas.width = canvas.width;
    exportCanvas.height = canvas.height;
    const exportCtx = exportCanvas.getContext("2d");

    // Copy the main canvas content
    exportCtx.drawImage(canvas, 0, 0);

    // Add watermark to the export canvas
    addWatermark(exportCtx, exportCanvas.width, exportCanvas.height);

    // Create a temporary link for download
    const link = document.createElement("a");
    link.download = "image-with-gradient-background.png";
    link.href = exportCanvas.toDataURL("image/png", quality);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });

  // Custom color handlers
  addColor1Btn.addEventListener("click", () => {
    addCustomColor(customColor1.value);
  });

  addColor2Btn.addEventListener("click", () => {
    addCustomColor(customColor2.value);
  });

  addColor3Btn.addEventListener("click", () => {
    addCustomColor(customColor3.value);
  });

  resetColorsBtn.addEventListener("click", () => {
    activeCustomColors = [];
    activeColors = [...extractedColors];
    updateColorDisplay();
    updateCanvas();
  });

  // Settings change handlers
  const settingsInputs = [
    gradientType,
    gradientDirection,
    paddingInput,
    imageScaleInput,
    rotationInput,
    borderWidthInput,
    borderColorInput,
    borderRadiusInput,
    customWidthInput,
    customHeightInput,
  ];

  settingsInputs.forEach((input) => {
    input.addEventListener("change", updateCanvas);
  });

  function changeElementsAfterUpload() {
    dashedUploadAreas.style.display = "none";
    regenerateBtn.style.display = "block";
  }

  function handleImageUpload(e) {
    const file = e.target.files[0] || e.dataTransfer.files[0];

    if (file && file.type.match("image.*")) {
      const reader = new FileReader();

      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          originalImage = img;
          processImage(img);
          regenerateBtn.disabled = false;
        };
        img.src = event.target.result;
      };

      reader.readAsDataURL(file);
    }
  }

  function processImage(img) {
    // Create a temp canvas to extract colors
    const tempCanvas = document.createElement("canvas");
    const tempCtx = tempCanvas.getContext("2d");

    // Resize for color extraction (smaller is faster)
    tempCanvas.width = 50;
    tempCanvas.height = 50;

    // Draw image on temp canvas
    tempCtx.drawImage(img, 0, 0, tempCanvas.width, tempCanvas.height);

    // Extract colors from the image
    extractedColors = extractDominantColors(
      tempCtx,
      tempCanvas.width,
      tempCanvas.height
    );
    activeColors = [...extractedColors];

    // Display extracted colors
    updateColorDisplay();

    // Update the main canvas
    updateCanvas();
  }

  function extractDominantColors(ctx, width, height) {
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    const colorMap = {};
    const sampleRate = 2; // Sample every 2 pixels to improve performance

    // Count color occurrences
    for (let i = 0; i < data.length; i += 4 * sampleRate) {
      if (data[i + 3] < 128) continue; // Skip transparent pixels

      // Get RGB values
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      // Quantize colors to reduce unique values
      const qr = Math.floor(r / 10) * 10;
      const qg = Math.floor(g / 10) * 10;
      const qb = Math.floor(b / 10) * 10;

      const colorKey = `${qr},${qg},${qb}`;

      if (colorMap[colorKey]) {
        colorMap[colorKey].count++;
      } else {
        colorMap[colorKey] = {
          r: qr,
          g: qg,
          b: qb,
          count: 1,
        };
      }
    }

    // Convert to array and sort by count
    const colors = Object.values(colorMap)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5) // Get top 5 colors
      .map((color) => `rgb(${color.r}, ${color.g}, ${color.b})`);

    return colors;
  }

  function updateColorDisplay() {
    // Clear previous colors
    // colorsDisplay.innerHTML = "<p>Extracted colors:</p>";
    colorsDisplay.innerHTML = `<label class="form-label">Extracted Colors</label>`;

    // const colorBoxContainer = document.querySelector('.color-box-container');
    const colorBoxContainer = document.createElement("div");
    colorBoxContainer.className = "color-box-container";
    // colorsDisplay.appendChild(colorBoxContainer);


    // Add color boxes for extracted colors
    extractedColors.forEach((color) => {
      const colorBox = document.createElement("div");
      colorBox.className = "color-box";
      colorBox.style.backgroundColor = color;

      // Add click handler to toggle color
      colorBox.addEventListener("click", () => {
        toggleExtractedColor(color, colorBox);
        updateCanvas();
      });

      // Check if this color is active
      if (activeColors.includes(color)) {
        colorBox.classList.add("selected");
      }

      colorBoxContainer.appendChild(colorBox);
      // colorsDisplay.appendChild(colorBoxContainer);

    });
    colorsDisplay.appendChild(colorBoxContainer);

    colorsDisplay.style.display = "flex";
  }

  function toggleExtractedColor(color, colorBox) {
    const index = activeColors.indexOf(color);

    if (index > -1) {
      // Remove color if it's already active
      activeColors.splice(index, 1);
      colorBox.classList.remove("selected");
    } else {
      // Add color if it's not active
      activeColors.push(color);
      colorBox.classList.add("selected");
    }
  }

  function addCustomColor(color) {
    // Add custom color if it's not already added
    if (!activeCustomColors.includes(color)) {
      activeCustomColors.push(color);
    }

    // Update canvas with new colors
    updateCanvas();
  }

  function updateCanvas() {
    if (!originalImage) return;

    // Get canvas dimensions based on aspect ratio
    const dimensions = getCanvasDimensions();
    const canvasWidth = dimensions.width;
    const canvasHeight = dimensions.height;

    // Get other settings
    const padding = parseInt(paddingInput.value) || 50;
    const imageScale = parseInt(imageScaleInput.value) || 80;
    const rotation = parseInt(rotationInput.value) || 0;
    const borderWidth = parseInt(borderWidthInput.value) || 0;
    const borderColor = borderColorInput.value;
    const borderRadius = parseInt(borderRadiusInput.value) || 0;

    // Set canvas size
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    // Create gradient background
    createGradientBackground(ctx, canvasWidth, canvasHeight);

    // Calculate scaled image dimensions
    const scaleFactor = imageScale / 100;
    const scaledWidth = originalImage.width * scaleFactor;
    const scaledHeight = originalImage.height * scaleFactor;

    // Calculate position to center the image
    const x = (canvasWidth - scaledWidth) / 2;
    const y = (canvasHeight - scaledHeight) / 2;

    // Create a temporary canvas for the rotated and rounded image
    const tempCanvas = document.createElement("canvas");
    const tempCtx = tempCanvas.getContext("2d");
    tempCanvas.width = scaledWidth + borderWidth * 2;
    tempCanvas.height = scaledHeight + borderWidth * 2;

    // Draw border with rounded corners if needed
    if (borderWidth > 0) {
      tempCtx.fillStyle = borderColor;
      roundRect(
        tempCtx,
        0,
        0,
        tempCanvas.width,
        tempCanvas.height,
        borderRadius + borderWidth
      );
    }

    // Create clipping path for the image with rounded corners
    tempCtx.save();
    roundRect(
      tempCtx,
      borderWidth,
      borderWidth,
      scaledWidth,
      scaledHeight,
      borderRadius
    );
    tempCtx.clip();

    // Draw the image
    tempCtx.drawImage(
      originalImage,
      borderWidth,
      borderWidth,
      scaledWidth,
      scaledHeight
    );
    tempCtx.restore();

    // Apply rotation
    ctx.save();
    ctx.translate(
      x + scaledWidth / 2 + borderWidth,
      y + scaledHeight / 2 + borderWidth
    );
    ctx.rotate((rotation * Math.PI) / 180);

    // Draw the temporary canvas containing the border and image
    ctx.drawImage(
      tempCanvas,
      -tempCanvas.width / 2,
      -tempCanvas.height / 2
    );

    ctx.restore();

    // Show canvas and enable download button
    canvas.style.display = "block";
    downloadBtn.disabled = false;
  }

  function getCanvasDimensions() {
    const aspectRatio = aspectRatioSelect.value;
    let width, height;

    if (aspectRatio === "custom") {
      width = parseInt(customWidthInput.value) || 1080;
      height = parseInt(customHeightInput.value) || 1920;
    } else {
      // Parse aspect ratio (e.g., "16:9")
      const [w, h] = aspectRatio.split(":").map(Number);

      // Base size on the image dimensions and padding
      const padding = parseInt(paddingInput.value) || 50;
      const baseWidth = originalImage.width + padding * 2;
      const baseHeight = originalImage.height + padding * 2;

      // Calculate dimensions based on aspect ratio
      if (baseWidth / baseHeight > w / h) {
        // Width is the limiting factor
        height = baseWidth * (h / w);
        width = baseWidth;
      } else {
        // Height is the limiting factor
        width = baseHeight * (w / h);
        height = baseHeight;
      }

      // Ensure minimum dimensions
      width = Math.max(width, 320);
      height = Math.max(height, 320);
    }

    return { width, height };
  }


  function createGradientBackground(ctx, width, height) {
    let gradient;
    const type = gradientType.value;

    const direction = gradientDirection.value;

    if (type === "linear") {
      // Map direction values to coordinates
      let x0, y0, x1, y1;

      switch (direction) {
        case "to right":
          x0 = 0;
          y0 = 0;
          x1 = width;
          y1 = 0;
          break;
        case "to bottom right":
          x0 = 0;
          y0 = 0;
          x1 = width;
          y1 = height;
          break;
        case "to top":
          x0 = 0;
          y0 = height;
          x1 = 0;
          y1 = 0;
          break;
        case "to left":
          x0 = width;
          y0 = 0;
          x1 = 0;
          y1 = 0;
          break;
        default: // to bottom
          x0 = 0;
          y0 = 0;
          x1 = 0;
          y1 = height;
      }

      gradient = ctx.createLinearGradient(x0, y0, x1, y1);
    } else {
      // Radial gradient
      const centerX = width / 2;
      const centerY = height / 2;
      const radius = Math.max(width, height) / 2;
      gradient = ctx.createRadialGradient(
        centerX,
        centerY,
        0,
        centerX,
        centerY,
        radius
      );
    }

    // Combine active extracted colors and custom colors
    const allColors = [...activeColors, ...activeCustomColors];

    // Add color stops
    if (allColors.length === 0) {
      // Fallback to a default gradient if no colors are selected
      gradient.addColorStop(0, "#f8f9fa");
      gradient.addColorStop(1, "#dee2e6");
    } else if (allColors.length === 1) {
      // If only one color, create a gradient from color to a lighter/darker version
      gradient.addColorStop(0, allColors[0]);
      gradient.addColorStop(1, adjustColorBrightness(allColors[0], 30));
    } else {
      allColors.forEach((color, index) => {
        gradient.addColorStop(index / (allColors.length - 1), color);
      });
    }

    // Fill the background
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
  }

  function adjustColorBrightness(color, percent) {
    // Extract RGB values
    let r, g, b;

    if (color.startsWith("rgb")) {
      const rgbMatch = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
      if (!rgbMatch) return color;

      r = parseInt(rgbMatch[1]);
      g = parseInt(rgbMatch[2]);
      b = parseInt(rgbMatch[3]);
    } else if (color.startsWith("#")) {
      // Convert hex to RGB
      const hex = color.substring(1);
      r = parseInt(hex.substring(0, 2), 16);
      g = parseInt(hex.substring(2, 4), 16);
      b = parseInt(hex.substring(4, 6), 16);
    }

    // Adjust brightness
    r = Math.min(255, Math.max(0, r + percent));
    g = Math.min(255, Math.max(0, g + percent));
    b = Math.min(255, Math.max(0, b + percent));

    return `rgb(${r}, ${g}, ${b})`;
  }

  // Helper function to draw a rectangle with rounded corners
  function roundRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    if (radius === 0) {
      ctx.rect(x, y, width, height);
    } else {
      // Constrain radius to half the smallest dimension
      radius = Math.min(radius, Math.min(width, height) / 2);

      ctx.moveTo(x + radius, y);
      ctx.lineTo(x + width - radius, y);
      ctx.arcTo(x + width, y, x + width, y + radius, radius);
      ctx.lineTo(x + width, y + height - radius);
      ctx.arcTo(
        x + width,
        y + height,
        x + width - radius,
        y + height,
        radius
      );
      ctx.lineTo(x + radius, y + height);
      ctx.arcTo(x, y + height, x, y + height - radius, radius);
      ctx.lineTo(x, y + radius);
      ctx.arcTo(x, y, x + radius, y, radius);
    }
    ctx.closePath();
    ctx.fill();
  }

  // Add this new function after the updateCanvas function
  function addWatermark(ctx, width, height) {
    ctx.save();

    // Set text properties
    ctx.font = '18px "Dancing Script"';
    ctx.fillStyle = "rgba(255, 255, 255, 0.8)";

    // Add shadow for better visibility
    ctx.shadowColor = "rgba(0, 0, 0, 0.7)";
    ctx.shadowBlur = 3;
    ctx.shadowOffsetX = 1;
    ctx.shadowOffsetY = 1;

    // Add the text
    const text = "Status Reposter";
    const textMetrics = ctx.measureText(text);
    const padding = 20;

    // Position in bottom right corner
    const x = width - textMetrics.width - padding;
    const y = height - padding;

    ctx.fillText(text, x, y);
    ctx.restore();
  }
});


