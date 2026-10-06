<?php

namespace Database\Seeders;

use App\Models\GalleryItem;
use App\Models\ProcessStep;
use App\Models\Product;
use App\Models\Setting;
use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::query()->firstOrCreate(
            ['email' => 'admin@azorde.estudio'],
            ['name' => 'AZORDE', 'password' => 'admin123'],
        );
        $admin->forceFill(['is_admin' => true])->save();

        foreach ($this->settings() as $key => $value) {
            Setting::query()->firstOrCreate(['key' => $key], ['value' => $value]);
        }

        if (Product::query()->doesntExist()) {
            foreach ($this->products() as $index => $product) {
                Product::query()->create($product + ['sort_order' => $index, 'active' => true, 'featured' => $index < 8]);
            }
        }

        if (ProcessStep::query()->doesntExist()) {
            foreach ($this->steps() as $index => $step) {
                ProcessStep::query()->create($step + ['sort_order' => $index]);
            }
        }

        if (GalleryItem::query()->doesntExist()) {
            foreach ($this->gallery() as $index => $item) {
                GalleryItem::query()->create($item + ['sort_order' => $index]);
            }
        }
    }

    private function settings(): array
    {
        return [
            'announce' => 'Peças autorais, feitas à mão em Montes Claros · MG',
            'about_eyebrow' => 'Sobre o ateliê',
            'about_title' => "Cerâmica artesanal\nfeita à mão",
            'about_text' => "O Azorde é o ateliê de Isabela Malheiros, em Montes Claros. O nome vem de “às ordens”: o fazer manual como um gesto de cuidado e presença.\n\nAs peças nascem para a mesa e para a casa. Formas autorais, esmaltes minerais e o tempo da queima. Nenhuma sai igual à outra.\n\nMais do que objeto, cada peça guarda um pouco do dia em que foi feita.",
            'about_image' => '/assets/fotos/retrato.jpg',
            'process_title' => 'O processo',
            'process_lead' => 'Do barro ao objeto, no tempo da peça.',
            'process_image' => '/assets/fotos/ferramentas.jpg',
            'band_eyebrow' => 'Na mesa',
            'band_title' => "Mesa cheia,\ncoração também",
            'band_text' => 'As peças do Azorde existem para serem usadas: o café da manhã, o almoço com gente em volta, o canto da casa que pede um objeto com história.',
            'band_image' => '/assets/fotos/mesa-cheia.jpg',
            'quote_image' => '/assets/fotos/parede-poesia.jpg',
            'gallery_title' => 'Galeria',
            'gallery_lead' => 'Um recorte do ateliê e das peças que saem dele.',
            'contact_eyebrow' => 'Visita e contato',
            'contact_title' => 'O estúdio',
            'contact_text' => 'Para reservar uma peça, combinar um presente ou saber das oficinas, fale direto com o ateliê.',
            'address' => "R. Santa Maria, 662\nTodos os Santos, Montes Claros / MG",
            'email' => 'azorde.estudio@gmail.com',
            'instagram' => 'https://www.instagram.com/azorde.estudio/',
            'hours' => 'Segunda a sexta, 9h às 18h',
            'whatsapp' => '5538997351632',
            'footer_tagline' => 'Cerâmica artesanal para a mesa e para a casa.',
            'pix_percent' => '5',
            'frete_aproximado' => '29.90',
            'cep_origem' => '',
            'melhor_envio_token' => '',
            'melhor_envio_servicos' => '1,2',
            'peso_padrao_gramas' => '800',
            'caixa_comprimento' => '20',
            'caixa_largura' => '16',
            'caixa_altura' => '10',
        ];
    }

    private function products(): array
    {
        return [
            ['name' => 'Xícara vermelha', 'slug' => 'xicara-vermelha', 'price_cents' => 12800, 'image' => '/assets/fotos/caneca-vermelha.jpg', 'alt' => 'Xícara vermelha esmaltada'],
            ['name' => 'Xícara com pires', 'slug' => 'xicara-pires', 'price_cents' => 18600, 'image' => '/assets/fotos/caneca-pires.jpg', 'alt' => 'Xícara vermelha sobre pires azul com rosas'],
            ['name' => 'Canecas baiacu', 'slug' => 'canecas-baiacu', 'price_cents' => 24800, 'image' => '/assets/fotos/canecas-baiacu.jpg', 'alt' => 'Par de canecas em forma de baiacu'],
            ['name' => 'Petisqueira polvo', 'slug' => 'petisqueira-polvo', 'price_cents' => 32000, 'image' => '/assets/fotos/petisqueira-polvo.jpg', 'alt' => 'Petisqueira azul com polvo de cerâmica'],
            ['name' => 'Cartas de cerâmica', 'slug' => 'cartas', 'price_cents' => 19600, 'image' => '/assets/fotos/cartas.jpg', 'alt' => 'Par de cartas de cerâmica com corações'],
            ['name' => 'Bandeja com rosas', 'slug' => 'bandeja-rosas', 'price_cents' => 27400, 'image' => '/assets/fotos/bandeja-rosas.jpg', 'alt' => 'Bandeja azul com rosas na borda'],
            ['name' => 'Bandeja mármore', 'slug' => 'bandeja-marmore', 'price_cents' => 29800, 'image' => '/assets/fotos/bandeja-marmore.jpg', 'alt' => 'Bandeja com esmalte em veios de mármore'],
            ['name' => 'Copos-lírio', 'slug' => 'copos-lirio', 'price_cents' => 23600, 'image' => '/assets/fotos/copos-lirio.jpg', 'alt' => 'Copos de cerâmica em forma de lírio'],
            ['name' => 'Envelope azul', 'slug' => 'envelope-azul', 'price_cents' => 16800, 'image' => '/assets/fotos/envelope-azul.jpg', 'alt' => 'Envelope de cerâmica azul'],
            ['name' => 'Prato orgânico', 'slug' => 'prato-organico', 'price_cents' => 21400, 'image' => '/assets/fotos/prato-organico.jpg', 'alt' => 'Prato orgânico claro'],
            ['name' => 'Escultura azul', 'slug' => 'escultura-azul', 'price_cents' => 42000, 'image' => '/assets/fotos/escultura-azul.jpg', 'alt' => 'Escultura azul-escura de cerâmica'],
            ['name' => 'Imagem azul', 'slug' => 'imagem-azul', 'price_cents' => 35600, 'image' => '/assets/fotos/santinha.jpg', 'alt' => 'Imagem de cerâmica azul com rosas'],
        ];
    }

    private function steps(): array
    {
        return [
            ['label' => '01', 'title' => 'Modelagem', 'body' => 'A forma nasce na mão, no torno ou na escultura, pensada para o uso.'],
            ['label' => '02', 'title' => 'Secagem', 'body' => 'A peça descansa até perder a umidade. Essa espera faz parte do ofício.'],
            ['label' => '03', 'title' => 'Esmalte', 'body' => 'Minerais cobrem a superfície e desenham cor, brilho e toque.'],
            ['label' => '04', 'title' => 'Queima', 'body' => 'A alta temperatura fecha o trabalho. Pequenas variações são a assinatura.'],
        ];
    }

    private function gallery(): array
    {
        return [
            ['image' => '/assets/fotos/retrato-estudio.jpg', 'alt' => 'Isabela Malheiros no estúdio'],
            ['image' => '/assets/fotos/escultura-azul.jpg', 'alt' => 'Escultura azul-escura de cerâmica'],
            ['image' => '/assets/fotos/santinha.jpg', 'alt' => 'Imagem de cerâmica azul com rosas'],
            ['image' => '/assets/fotos/envelope-azul.jpg', 'alt' => 'Envelope de cerâmica azul'],
            ['image' => '/assets/fotos/prato-organico.jpg', 'alt' => 'Prato orgânico claro'],
            ['image' => '/assets/fotos/forma-marmore.jpg', 'alt' => 'Forma oval com esmalte marmorizado'],
            ['image' => '/assets/fotos/atelie-pratos.jpg', 'alt' => 'Pratos sobre a bancada do ateliê'],
            ['image' => '/assets/fotos/retrato-baiacu.jpg', 'alt' => 'Isabela com as canecas baiacu'],
            ['image' => '/assets/fotos/prato-textura.jpg', 'alt' => 'Prato texturizado e bandeja floral'],
            ['image' => '/assets/fotos/galeria-sorrisos.jpg', 'alt' => 'Isabela entre duas peças de cerâmica'],
        ];
    }
}
