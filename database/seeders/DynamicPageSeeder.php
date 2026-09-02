<?php

namespace Database\Seeders;


use App\Models\DynamicPage;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DynamicPageSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $pages = [
            [
                'page_title' => 'Terms of Service',
                'page_slug' => 'terms-of-service',
                'page_content' => 'Terms of Service',
            ],
            [
                'page_title' => 'Privacy Policy',
                'page_slug' => 'privacy-policy',
                'page_content' => 'Privacy Policy',
            ],
            [
                'page_title' => 'Disclaimer',
                'page_slug' => 'disclaimer',
                'page_content' => 'Disclaimer',
            ],
        ];

        foreach ($pages as $page) {
            DynamicPage::create([
                'page_title' => $page['page_title'],
                'page_slug' => $page['page_slug'],
                'page_content' => $page['page_content'],
            ]);
        }
    }
}
