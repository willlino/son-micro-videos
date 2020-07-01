<?php

namespace Tests\Feature\Http\Controllers\Api;

use App\Models\Category;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Illuminate\Foundation\Testing\TestResponse;
use Tests\TestCase;

class CategoryControllerTest extends TestCase
{
    use DatabaseMigrations;

    public function testIndex()
    {
        $category = factory(Category::class)->create();
        $response = $this->get(route('categories.index'));

        $response
            ->assertStatus(200)
            ->assertJson([$category->toArray()]);
    }

    public function testShow()
    {
        $category = factory(Category::class)->create();
        $response = $this->get(route('categories.show', ['category' => $category->id]));

        $response
            ->assertStatus(200)
            ->assertJson($category->toArray());
    }

    public function testInvalidationData()
    {
        $response = $this->json('POST', route('categories.store'), []);
        $this->assertInvalidationRequired($response);

        $response = $this->json('POST', route('categories.store'), [
            'name' => str_repeat('a', 256),
            'active' => 'a'
        ]);
        $this->assertInvalidationMax($response);
        $this->assertInvalidationBoolean($response);

        $category = factory(Category::class)->create();
        $response = $this->json('PUT', route('categories.update', ['category' => $category->id]), []);
        $this->assertInvalidationRequired($response);

        $response = $this->json(
            'PUT',
            route('categories.update', ['category' => $category->id]),
            [
                'name' => str_repeat('a', 256),
                'active' => 'a'
            ]
        );
        $this->assertInvalidationMax($response);
        $this->assertInvalidationBoolean($response);
    }

    protected function assertInvalidationRequired(TestResponse $response)
    {
        $response->assertStatus(422)
            ->assertJsonValidationErrors(['name'])
            ->assertJsonMissingValidationErrors(['active'])
            ->assertJsonFragment([
                \Lang::get('validation.required', ['attribute' => 'name'])
            ]);
    }

    protected function assertInvalidationBoolean(TestResponse $response)
    {
        $response->assertStatus(422)
            ->assertJsonValidationErrors(['active'])
            ->assertJsonFragment([
                \Lang::get('validation.boolean', ['attribute' => 'active'])
            ]);
    }

    protected function assertInvalidationMax(TestResponse $response)
    {
        $response->assertStatus(422)
            ->assertJsonValidationErrors(['name'])
            ->assertJsonFragment([
                \Lang::get('validation.max.string', ['attribute' => 'name', 'max' => 255])
            ]);
    }

    public function testStore()
    {
        $response = $this->json('POST', route('categories.store'), [
            'name' => 'test'
        ]);

        $id = $response->json('id');
        $category = Category::find($id);
        $response->assertStatus(201)
            ->assertJson($category->toArray());
        $this->assertTrue($response->json('active'));
        $this->assertNull($response->json('description'));


        $response = $this->json('POST', route('categories.store'), [
            'name' => 'test',
            'active' => false,
            'description' => 'description'
        ]);

        $response->assertJsonFragment([
            'active' => false,
            'description' => 'description'
        ]);
    }

    public function testUpdate()
    {
        $category = factory(Category::class)->create([
            'description' => 'desc',
            'active' => false
        ]);
        $response = $this->json(
            'PUT',
            route('categories.update', $category->id),
            [
                'name' => 'test',
                'description' => 'test',
                'active' => true
            ]
        );

        $id = $response->json('id');
        $category = Category::find($id);
        $response->assertStatus(200)
            ->assertJson($category->toArray())
            ->assertJsonFragment([
                'description' => 'test',
                'active' => true
            ]);

        $response = $this->json(
            'PUT',
            route('categories.update', $category->id),
            [
                'name' => 'test',
                'description' => '',
                'active' => true
            ]
        );
        $response->assertJsonFragment([
            'description' => null,
        ]);

        $category->description = 'test';
        $category->save();
        $response = $this->json(
            'PUT',
            route('categories.update', $category->id),
            [
                'name' => 'test',
                'description' => null,
                'active' => true
            ]
        );
        $response->assertJsonFragment([
            'description' => null,
        ]);
    }

    public function testDestroy()
    {
        $category = factory(Category::class)->create();
        $response = $this->delete(route('categories.destroy', ['category' => $category->id]));
        
        $categories = Category::all();
        $this->assertEmpty($categories);

        $categories = Category::onlyTrashed()->get();
        $this->assertCount(1, $categories);  

        $response
            ->assertStatus(204);
    }
}
