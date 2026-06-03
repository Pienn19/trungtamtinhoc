export const getCourseImageSrc = (imageValue?: string | null) => {
    if (!imageValue) {
        return ''
    }

    if (imageValue.startsWith('data:')) {
        return imageValue
    }

    if (imageValue.startsWith('http://') || imageValue.startsWith('https://') || imageValue.startsWith('/')) {
        return imageValue
    }

    // Return the image path inside the public folder. Caller may pass full path or filename.
    return `/images/${imageValue}`
}