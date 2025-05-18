<script>
import { Buffer } from 'buffer';
import { state, socket } from "@/socket";

export default {
    components: {
    },
    props: {
        img: {
            type: Object,
            required: true
        },
    },
    data() {
        return {
            imageView: null,
            image: null,
            canvas: null,
            context: null,
            width: null,
            height: null,
            data: {},
            canCropImg: true,
            canRemoveBg: true,
        }
    },
    mounted() {
        this.canvas = document.getElementById("canvas");
        this.context = canvas.getContext("2d");
        this.imageView = this.img.src;
        this.reloadImage();
    },
    methods: {
        cropImage() {
            if (this.canCropImg) {
                this.canCropImg = false;
                this.data = this.context.getImageData(0, 0, this.image.width, this.image.height).data;

                var top = this.scanY(true);
                var bottom = this.scanY(false);
                var left = this.scanX(true);
                var right = this.scanX(false);

                var new_width = right - left;
                var new_height = bottom - top;

                this.canvas.width = new_width;
                this.canvas.height = new_height;

                this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
                this.context.drawImage(this.image, left, top, new_width, new_height, 0, 0, new_width, new_height);
                this.imageView = this.canvas.toDataURL("image/png");
                this.reloadImage();
            }
        },
        getRGB(x, y) {
            return {
                red: this.data[((this.image.width * y) + x) * 4],
                green: this.data[((this.image.width * y) + x) * 4 + 1],
                blue: this.data[((this.image.width * y) + x) * 4 + 2]
            };
        },
        isColor(rgb) {
            return (rgb.red == 0 || rgb.red == 255) && (rgb.green == 0 || rgb.green == 255) && (rgb.blue == 0 || rgb.blue == 255);
        },
        scanY(top) {
            var offset = (top) ? 1 : -1;

            for (var y = ((top) ? 0 : this.image.height - 1); ((top) ? (y < this.image.height) : (y > -1)); y += offset) {
                for (var x = 0; x < this.image.width; x++) {
                    if (!this.isColor(this.getRGB(x, y))) {
                        return y;
                    }
                }
            }

            return null;
        },
        scanX(left) {
            var offset = (left) ? 1 : -1;

            for (var x = ((left) ? 0 : this.image.width - 1); ((left) ? (x < this.image.width) : (x > -1)); x += offset) {
                for (var y = 0; y < this.image.height; y++) {
                    if (!this.isColor(this.getRGB(x, y))) {
                        return x;
                    }
                }
            }

            return null;
        },
        async removeBg() {
            if (this.canRemoveBg) {
                this.canRemoveBg = false;
                const blob = await new Promise((resolve) => this.canvas.toBlob(resolve, "image/png"));

                const formData = new FormData();
                formData.append("file", blob, "canvas_image.png");

                try {
                    const response = await fetch("http://racing.coto-app.xyz/remove-background/", {
                        method: "POST",
                        mode: "cors",
                        body: formData,
                    });

                    if (!response.ok) {
                        throw new Error("Erreur lors de la suppression de l'arrière-plan");
                    }

                    const imageBlob = await response.blob();
                    this.imageView = URL.createObjectURL(imageBlob);
                    this.reloadImage();
                } catch (error) {
                    console.error("Erreur lors de la suppression de l'arrière-plan :", error);
                }
            }
        },
        reloadImage() {
            this.context.reset();
            this.image = new Image();
            this.image.src = this.imageView;
            this.image.onload = function (parent) {
                parent.canvas.width = parent.image.width;
                parent.canvas.height = parent.image.height;

                parent.context.drawImage(parent.image, 0, 0, parent.image.width, parent.image.height);

                parent.imageView = this.canvas.toDataURL("image/png");
            }.bind(this, this);
        },
    },
    computed: {
    }
}
</script>

<template>
    <div class="page-img-edit">
        <div class="container h-full mx-auto flex flex-col justify-center items-center">
            <div class="modal-container">
                <canvas id="canvas"></canvas>
                <div class="choice-container">
                    <button type="button" @click="cropImage" :class="{ 'btn-disabled': canCropImg }"
                        class="btn crop-auto-btn">Recadrer
                        automatiquement</button>
                    <button type="button" @click="removeBg" :class="{ 'btn-disabled': canRemoveBg }"
                        class="btn bg-remove-btn">Retirer le
                        fond</button>
                </div>
                <div class="form-container">
                    <button @click="$emit('closeImgEdit')" class="btn btn-cancel">Annuler</button>
                    <button @click="$emit('confirmImgEdit', { src: imageView, name: img.name })"
                        class="btn btn-confirm">Confirmer</button>
                </div>
            </div>
        </div>
    </div>
</template>

<style lang="scss">
.page-img-edit {
    @apply fixed inset-0 bg-neutral-200/80 p-4 flex justify-center items-center;
    z-index: 10000;

    .modal-container {
        @apply bg-white rounded-lg shadow-lg p-4 max-w-3xl max-h-full overflow-auto;
        @apply flex flex-col items-center justify-center w-1/2 p-4 max-h-[50%];

        canvas {
            @apply max-w-full h-full object-contain border-4 border-black bg-red-100;
        }

        .choice-container {
            @apply flex flex-col items-center space-y-5 w-full;

            .btn {
                @apply bg-neutral-200 border-neutral-400 h-auto max-w-none w-auto px-3 py-1;

                &:hover {
                    @apply bg-neutral-200 border-neutral-200;
                }
            }
        }

        .form-container {
            @apply flex justify-between items-center w-full mt-4;
        }
    }
}
</style>
