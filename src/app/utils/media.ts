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
