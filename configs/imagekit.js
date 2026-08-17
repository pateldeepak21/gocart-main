import ImageKit from "imagekit";

var imagekit = new ImageKit({
    publickey : process.env.IMAGEKIT_PUBLIC_KEY,
    privatekey : process.env.IMAGEKIT_PRIVATE_KEY,
    urlEndpoint : process.env.IMAGEKIT__URL_ENDPOINT
});