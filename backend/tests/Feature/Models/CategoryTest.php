<?php

namespace Tests\Feature\Models;

use App\Models\Category;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;

class CategoryTest extends TestCase
{
    use DatabaseMigrations;

    public function testList()
    {
        factory(Category::class, 1)->create();
        $categories = Category::all();
        $this->assertCount(1, $categories);
        $categoryKey = array_keys($categories->first()->getAttributes());
        $this->assertEqualsCanonicalizing([
            'id', 'name', 'description', 'active', 'created_at', 'updated_at', 'deleted_at'
        ], $categoryKey);
    }

    public function testCreate() {
        $category = Category::create([
            'name' => 'test1'
        ]);
        $category->refresh();

        $this->assertEquals('test1', $category->name);
        $this->assertNull($category->description);
        $this->assertTrue($category->active);

        $category = Category::create([
            'name' => 'test1',
            'description' => null
        ]);
        $this->assertNull($category->description);

        $category = Category::create([
            'name' => 'test1',
            'description' => 'test description'
        ]);
        $this->assertEquals("test description", $category->description);

        $category = Category::create([
            'name' => 'test1',
            'active' => false
        ]);
        $this->assertFalse($category->active);

        $category = Category::create([
            'name' => 'test1',
            'active' => true
        ]);
        $this->assertTrue($category->active);

        $category = Category::create([
            'name' => 'test1',
        ]);
        $this->assertTrue(preg_match('/^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i', $category->id) === 1);
    }

    public function testUpdate() {

        $category = factory(Category::class)->create([
            'description' => 'test description',
            'active' => true
        ])->first();

        $data = [
            'name' => 'test_name updated',
            'description' => 'test_description updated',
            'active' => false
        ];
        $category->update($data);

        foreach($data as $key => $value){
            $this->assertEquals($value, $category->{$key});
        }
    }

    public function testDelete() {
        $category = factory(Category::class, 1)->create()->first();
        $category->refresh();

        $category->delete();
        $categories = Category::all();
        $this->assertCount(0, $categories);
        $this->assertNull(Category::find($category->id));

        $categories = Category::onlyTrashed()->get();
        $this->assertCount(1, $categories);

        $category->restore();
        $this->assertNotNull(Category::find($category->id));
        $this->assertCount(1, $categories);

        $categories = Category::onlyTrashed()->get();
        $this->assertCount(0, $categories);
    }
}
