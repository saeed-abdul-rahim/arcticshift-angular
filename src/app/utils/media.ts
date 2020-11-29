import { IMAGE_SM, IMAGE_SS } from '@constants/imageSize';
import { Content, ContentType } from '@models/Common';

export function getSmallestThumbnail(images?: Content[]) {
    if (images && images.length > 0) {
        const image = images[0];
        const thumbnail = image.thumbnails.find(thumb => thumb.dimension === IMAGE_SS);
        return thumbnail.url;
    }
}

export function getUploadPreviewImages(images?: Content[]) {
    if (!images) {
        return [];
    }
    return images.map(img => {
        if (img.thumbnails) {
            const { thumbnails } = img;
            return thumbnails.find(thumb => thumb.dimension === IMAGE_SM);
        }
    });
}

export function setThumbnails(images: Content[], name: string, imageSize: number) {
    let allThumbnails = [];
    if (images && images.length > 0) {
        const filteredImages = images.slice(0, 2);
        allThumbnails = filteredImages.map(image => {
            const { thumbnails } = image;
            const thumbnail = thumbnails.find(thumb => thumb.dimension === imageSize);
            return {
                title: name,
                url: thumbnail.url
            };
        });
    }
    return allThumbnails;
}

export function checkImage(file?: File) {
    if (!file) {
        return null;
    }
    const fileTypes = ['image/png', 'image/jpeg'];
    if (!fileTypes.includes(file.type)) {
        return null;
    }
    return file.type.split('/')[0] as ContentType;
}

export const blobToBase64 = async (blob: Blob): Promise<string | ArrayBuffer> => {
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    return await new Promise(resolve => {
      reader.onloadend = () => {
        resolve(reader.result);
      };
    });
};
