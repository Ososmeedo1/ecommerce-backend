import ImageKit from "imagekit"


export const imageKitConfig = () => {
  const imageKit = new ImageKit({
    publicKey: process.env.IMAGE_KIT_PUBLIC_KEY,
    privateKey: process.env.IMAGE_KIT_PRIVATE_KEY,
    urlEndpoint: process.env.IMAGE_KIT_URL_ENDPOINT
  });

  return imageKit;
}

export const uploadFile = async ({ file, folder = "General", fileName }) => {

  if (!file) {
    return next("Upload an image", 400);
  }

  let options = { folder };

  if (file) {
    options.file = file;
  }

  if (fileName) {
    options.fileName = fileName
  }

  const {url, filePath} = await imageKitConfig().upload({
    ...options
  })

  return {url, filePath}
}