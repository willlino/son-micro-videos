<?php

namespace Tests\Unit\Models;

use App\Models\CastMember;
use App\Models\Traits\Uuid;
use Illuminate\Database\Eloquent\SoftDeletes;
use PHPUnit\Framework\TestCase;

class CastMemberUnitTest extends TestCase
{

    private $castMember;

    protected function setup(): void
    {
        parent::setUp();
        $this->castMember = new CastMember();
    }

    public function testFillable()
    {
        $fillable = ['name', 'type', 'active'];
        $this->assertEquals($fillable, $this->castMember->getFillable());
    }

    public function testDates()
    {
        $dates = ['deleted_at', 'created_at', 'updated_at'];
        foreach ($dates as $date) {
            $this->assertContains($date, $this->castMember->getdates());
        }

        $this->assertCount(count($dates), $this->castMember->getDates());
    }

    public function testIfUseTraits()
    {
        $traits = [
            SoftDeletes::class, Uuid::class
        ];

        $castMemberTraits = array_keys(class_uses(CastMember::class));
        $this->assertEquals($traits, $castMemberTraits);
    }

    public function testCasts()
    {
        $casts = [
            'id' => 'string',
            'type' => 'smallInteger',
            'active' => 'boolean'
        ];
        $this->assertEquals($casts, $this->castMember->getCasts());
    }

    public function testIncrementing()
    {
        $this->assertFalse($this->castMember->incrementing);
    }
}
