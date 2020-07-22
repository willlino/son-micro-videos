<?php

namespace Tests\Feature\Http\Controllers\Api;

use App\Models\CastMember;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Tests\TestCase;
use Tests\Traits\TestSaves;
use Tests\Traits\TestValidations;

class CastMemberControllerTest extends TestCase
{
    use DatabaseMigrations, TestValidations, TestSaves;
    private $castMember;
    protected function setUp(): void
    {
        parent::setUp();
        $this->castMember = factory(CastMember::class)->create();
    }


    public function testIndex()
    {
        $response = $this->get(route('cast_members.index'));

        $response
            ->assertStatus(200)
            ->assertJson([$this->castMember->toArray()]);
    }

    public function testShow()
    {
        $response = $this->get(route('cast_members.show', ['cast_member' => $this->castMember->id]));

        $response
            ->assertStatus(200)
            ->assertJson($this->castMember->toArray());
    }

    public function testInvalidationData()
    {
        $data = [
            'name' => ''
        ];
        $this->assertInvalidationInStoreAction($data, 'required');
        $this->assertInvalidationInUpdateAction($data, 'required');

 
        $data = [
            'name' => str_repeat('a', 256),
        ];
        $this->assertInvalidationInStoreAction($data, 'max.string', ['max' => 255]);
        $this->assertInvalidationInUpdateAction($data, 'max.string', ['max' => 255]);
        
        $data = [
            'active' => 'a'
        ];
        $this->assertInvalidationInStoreAction($data, 'boolean');
        $this->assertInvalidationInUpdateAction($data, 'boolean');
    }

    public function testStore()
    {
        $data = [
            'name' => 'test',
            'type' => CastMember::TYPE_DIRECTOR
        ];
        $response = $this->assertStore($data, $data + ['active' => true, 'deleted_at' => null]);
        $response->assertJsonStructure([
            'created_at', 'updated_at'
        ]);

        $data = [
            'name' => 'test',
            'type' => CastMember::TYPE_ACTOR,
            'active' => false
        ];
        $this->assertStore($data, $data + ['deleted_at' => null]);
    }

    public function testUpdate()
    {
        $this->castMember = CastMember::create([
            'name' => 'test_name',
            'type' => CastMember::TYPE_ACTOR,
            'active' => false
        ]);
        $data = [
            'name' => 'test',
            'type' => CastMember::TYPE_DIRECTOR,
            'active' => true
        ];
        $response = $this->assertUpdate($data, $data + ['deleted_at' => null]);
        $response->assertJsonStructure([
            'created_at', 'updated_at'
        ]);

        $data = [
            'name' => 'test',
            'type' => CastMember::TYPE_ACTOR,
            'active' => false
        ];
        $this->assertUpdate($data, array_merge($data, ['active' => false]));
    }

    public function testDestroy()
    {
        $response = $this->delete(route('cast_members.destroy', ['cast_member' => $this->castMember->id]));

        $castMembers = CastMember::all();
        $this->assertEmpty($castMembers);

        $castMembers = CastMember::onlyTrashed()->get();
        $this->assertCount(1, $castMembers);

        $response
            ->assertStatus(204);
    }

    protected function routeStore()
    {
        return route('cast_members.store');
    }

    protected function routeUpdate()
    {
        return route('cast_members.update', ['cast_member' => $this->castMember->id]);
    }

    protected function model()
    {
        return CastMember::class;
    }
}
