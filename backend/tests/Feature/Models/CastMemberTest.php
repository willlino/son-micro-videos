<?php

namespace Tests\Feature\Models;

use App\Models\CastMember;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Tests\TestCase;

class CastMemberTest extends TestCase
{
    use DatabaseMigrations;

    public function testList()
    {
        factory(CastMember::class, 1)->create();
        $castMembers = CastMember::all();
        $this->assertCount(1, $castMembers);
        $castMemberKey = array_keys($castMembers->first()->getAttributes());
        $this->assertEqualsCanonicalizing([
            'id', 'name', 'type', 'active', 'created_at', 'updated_at', 'deleted_at'
        ], $castMemberKey);
    }

    public function testCreate()
    {
        $castMember = CastMember::create([
            'name' => 'test1',
            'type' => CastMember::TYPE_ACTOR
        ]);
        $castMember->refresh();

        $this->assertEquals('test1', $castMember->name);
        $this->assertEquals(CastMember::TYPE_ACTOR, $castMember->type);
        $this->assertTrue($castMember->active);

        $castMember = CastMember::create([
            'name' => 'test1',
            'type' => CastMember::TYPE_DIRECTOR,
            'active' => false
        ]);
        $this->assertFalse($castMember->active);
        $this->assertEquals(CastMember::TYPE_DIRECTOR, $castMember->type);

        $castMember = CastMember::create([
            'name' => 'test1',
            'type' => CastMember::TYPE_DIRECTOR,
            'active' => true
        ]);
        $this->assertTrue($castMember->active);

        $castMember = CastMember::create([
            'name' => 'test1',
            'type' => CastMember::TYPE_DIRECTOR
        ]);
        $this->assertTrue(preg_match('/^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i', $castMember->id) === 1);
    }

    public function testUpdate()
    {

        $castMember = factory(CastMember::class)->create([
            'type' => CastMember::TYPE_ACTOR,
            'active' => true
        ])->first();

        $data = [
            'name' => 'test_name updated',
            'type' => CastMember::TYPE_DIRECTOR,
            'active' => false
        ];
        $castMember->update($data);

        foreach ($data as $key => $value) {
            $this->assertEquals($value, $castMember->{$key});
        }
    }

    public function testDelete()
    {
        $castMember = factory(CastMember::class, 1)->create()->first();
        $castMember->refresh();

        $castMember->delete();
        $castMembers = CastMember::all();
        $this->assertCount(0, $castMembers);
        $this->assertNull(CastMember::find($castMember->id));

        $castMembers = CastMember::onlyTrashed()->get();
        $this->assertCount(1, $castMembers);

        $castMember->restore();
        $this->assertNotNull(CastMember::find($castMember->id));
        $this->assertCount(1, $castMembers);

        $castMembers = CastMember::onlyTrashed()->get();
        $this->assertCount(0, $castMembers);
    }
}
