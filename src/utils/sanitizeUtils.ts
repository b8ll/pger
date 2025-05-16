export function sanitizeInput(input: string): string {
    // Remove URLs
    input = input.replace(/(https?:\/\/[^\s]+)/g, '[URL Removed]');
    
    // Remove any file extensions
    input = input.replace(/\.(png|jpg|jpeg|gif|mp4|webm|mov|avi|mp3|wav|ogg|pdf|doc|docx|xls|xlsx|ppt|pptx|zip|rar|7z|exe|dll|bat|cmd|sh|ps1|js|html|htm|php|asp|aspx|jsp|py|rb|pl|cgi|swf|flv|wmv|m4v|mkv|iso|img|dmg|apk|ipa|deb|rpm|msi|pkg|tar|gz|bz2|xz|tgz|tbz2|txz|7z|zipx|ace|arc|arj|bz2|cab|cpio|deb|dmg|gz|iso|lzh|msi|pkg|rar|rpm|tar|tbz2|tgz|txz|wim|xar|zip|zipx)$/gi, '[File Extension Removed]');
    
    // Remove special characters that could be used for injection
    input = input.replace(/[<>{}[\]|\\^~`]/g, '');
    
    // Remove any remaining URLs that might have been missed
    input = input.replace(/(www\.[^\s]+)/g, '[URL Removed]');
    
    // Remove any remaining file paths
    input = input.replace(/([a-zA-Z]:\\[^\s]+|\\[^\s]+)/g, '[Path Removed]');
    
    // Remove any remaining suspicious patterns
    input = input.replace(/data:[^;]+;base64,[^\s]+/g, '[Base64 Data Removed]');
    //a
    return input.trim();
} 