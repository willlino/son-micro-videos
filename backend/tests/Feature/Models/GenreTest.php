<?php

namespace Tests\Feature\Models;

use App\Models\Genre;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;

class GenreTest extends TestCase
{
    use DatabaseMigrations;

    public function testList()
    {
        factory(Genre::class, 1)->create();
        $genres = Genre::all();
        $this->assertCount(1, $genres);
        $genreKey = array_keys($genres->first()->getAttributes());
        $this->assertEqualsCanonicalizing([
            'id', 'name', 'active', 'created_at', 'updated_at', 'deleted_at'
        ], $genreKey);
    }

    public function testCreate() {
        $genre = Genre::create([
            'name' => 'test1'
        ]);
        $genre->refresh();

        $this->assertEquals('test1', $genre->name);
        $this->assertTrue($genre->active);

        $genre = Genre::create([
            'name' => 'test1',
            'active' => true
        ]);
        $this->assertTrue($genre->active);

        $genre = Genre::create([
            'name' => 'test1',
            'active' => false
        ]);
        $this->assertFalse($genre->active);

        $genre = Genre::create([
            'name' => 'test1'
        ]);
        $this->assertTrue(preg_match('/^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i', $genre->id) === 1);
    }

    public function testUpdate(){
        $genre = Genre::create([
            'name' => 'test name',
            'active' => true
        ]);

        $data = [
            'name' => 'test_name updated',
            'active' => false
        ];

        $genre->update($data);

        foreach($data as $key => $value){
            $this->assertEquals($value, $genre->{$key});
        }
        
    }

    public function testDelete() {
        $genre = factory(Genre::class, 1)->create()->first();
        $genre->refresh();

        $genre->delete();
        $genres = Genre::all();
        $this->assertCount(0, $genres);
        $this->assertNull(Genre::find($genre->id));

        $genres = Genre::onlyTrashed()->get();
        $this->assertCount(1, $genres);

        $genre->restore();
        $this->assertNotNull(Genre::find($genre->id));
        $this->assertCount(1, $genres);

        $genres = Genre::onlyTrashed()->get();
        $this->assertCount(0, $genres);
    }
}
