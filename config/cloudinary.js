import { v2 as cloudinary } from 'cloudinary';

// Configuración básica de Cloudinary
cloudinary.config({
    cloud_name: 'dzrstenqb',
    api_key: '398629673296979',
    api_secret: 'Nq6PFaae1I72AmaZzCUbE2dPdjo',
    secure: true,
    timeout: 300000, // 5 minutos de timeout
    upload_timeout: 300000 // 5 minutos de timeout para subidas
});

// Configurar acceso público para recursos raw
const configureCloudinary = async () => {
    try {
        // Crear las carpetas si no existen
        await cloudinary.api.create_folder('evidencias').catch(() => {});
        await cloudinary.api.create_folder('perfiles').catch(() => {});
        
        // Crear imagen por defecto si no existe
        try {
            await cloudinary.api.resource('perfiles/default_profile');
            console.log('✅ Imagen por defecto ya existe');
        } catch (error) {
            if (error.error?.http_code === 404) {
                // Crear una imagen por defecto usando un placeholder
                await cloudinary.uploader.upload(
                    'https://via.placeholder.com/400x400/6366f1/ffffff?text=Usuario',
                    {
                        folder: 'perfiles',
                        public_id: 'default_profile',
                        overwrite: true,
                        tags: ['perfiles', 'default']
                    }
                );
                console.log('✅ Imagen por defecto creada');
            }
        }
        
        // Configurar acceso público para archivos raw
        await cloudinary.api.update_resources_access_mode_by_tag(
            'public',
            'evidencias',
            { resource_type: 'raw' }
        );

        console.log('✅ Configuración de Cloudinary completada');
    } catch (error) {
        console.error('⚠️ Aviso de configuración de Cloudinary:', error.message);
    }
};

// Función para generar URLs optimizadas
const generateCloudinaryUrls = (result, fileInfo) => {
    const originalName = fileInfo.originalname || result.original_filename || 'document.pdf';
    const safeName = originalName.replace(/[^a-zA-Z0-9._-]/g, '_');

    let secureUrl = (result.secure_url || '').replace('http://', 'https://');

    // Normalizar URLs incorrectas previas
    secureUrl = secureUrl
      .replace('/upload/fl_attachment:false/', '/upload/')
      .replace('/raw/upload/fl_attachment:false/', '/raw/upload/');

    // Para PDFs y otros documentos no imagen, usar resource_type raw para visualización
    if (fileInfo.mimetype === 'application/pdf' || !fileInfo.mimetype.startsWith('image/')) {
        // Asegurar /raw/upload/ para documentos
        secureUrl = secureUrl.replace('/image/upload/', '/raw/upload/');

        const viewUrl = secureUrl;
        const downloadUrl = secureUrl.replace(
            '/raw/upload/',
            `/raw/upload/fl_attachment:${encodeURIComponent(safeName)}/`
        );

        return {
            viewUrl,
            downloadUrl,
            displayName: originalName
        };
    }

    // Para imágenes: mantener visualización normal y generar URL de descarga con nombre
    const viewUrl = secureUrl.replace('/upload/fl_attachment:false/', '/upload/');
    const downloadUrl = viewUrl.replace(
        '/image/upload/',
        `/image/upload/fl_attachment:${encodeURIComponent(safeName)}/`
    );

    return {
        viewUrl,
        downloadUrl,
        displayName: originalName
    };
};

// Ejecutar configuración
configureCloudinary();

export { cloudinary as default, generateCloudinaryUrls };
